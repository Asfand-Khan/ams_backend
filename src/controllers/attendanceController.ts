import { Request, Response } from "express";
import { z } from "zod";
import {
  attendanceSummarySchema,
  checkInSchema,
  checkOutSchema,
  singleAttendanceSchema,
} from "../validations/attendanceValidations";
import { getEmployeeById } from "../services/employeeServices";
import {
  attendanceSummary,
  getDayStatus,
  getEmployeeAttendance,
  getEmployeeShift,
  ifCheckInExists,
  markCheckIn,
  markCheckOut,
  singleAttendance,
} from "../services/attendanceServices";
import { getCheckInStatus } from "../utils/getCheckInStatus";
import { getWorkStatus } from "../utils/getWorkStatusAndHours";

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/check-in
// Description --> Mark the check-in of the employee
export const checkInHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = checkInSchema.parse(req.body);

    const employee = await getEmployeeById(parsedData.employee_id);
    if (!employee) {
      return res.status(404).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    const attendanceExists = await ifCheckInExists(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    if (attendanceExists !== null) {
      throw new Error("Attendance already exists");
    }

    const shift = await getEmployeeShift(parsedData.employee_id);

    if (!shift) {
      throw new Error("Shift not found");
    }

    const checkInStatus = await getCheckInStatus(
      parsedData.check_in_time,
      shift.start_time,
      shift.grace_minutes
    );

    const attendance = await markCheckIn(parsedData, checkInStatus);

    return res.status(200).json({
      status: 1,
      message: "Employee checked-in successfully",
      payload: [attendance],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/check-out
// Description --> Mark the check-out of the employee
export const checkOutHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = checkOutSchema.parse(req.body);

    const employee = await getEmployeeById(parsedData.employee_id);
    if (!employee) {
      return res.status(404).json({
        status: 0,
        message: "Employee not found",
        payload: [],
      });
    }

    const attendance = await getEmployeeAttendance(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    if (attendance == null) {
      throw new Error("Attendance not found");
    }

    const work_status = await getWorkStatus(
      attendance.check_in_time,
      parsedData.check_out_time
    );

    const dayStatus = await getDayStatus(
      attendance.check_in_status,
      work_status.work_status,
      work_status.working_hours
    );

    const data = {
      ...parsedData,
      dayStatus,
      checkoutStatus: work_status.work_status,
      workingHours: work_status.working_hours,
      attendance_id: attendance.id,
    };

    const updatedAttendance = await markCheckOut(data);

    return res.status(200).json({
      status: 1,
      message: "Employee checked-out successfully",
      payload: [updatedAttendance],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/single-attendance
// Description --> Fetch the single attendance
export const getSingleAttendanceHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = singleAttendanceSchema.parse(req.body);
    const attendance = await singleAttendance(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    if (!attendance) {
      return res.status(404).json({
        status: 0,
        message: "Attendance not found",
        payload: [],
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Fetched single attendance successfully",
      payload: [attendance],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/summary
// Description --> Fetch attendance summary
export const getAttendanceSummaryHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendanceSummarySchema.parse(req.body);
    const attSummary = await attendanceSummary(
      parsedData.employee_id,
      parsedData.start_date,
      parsedData.end_date
    );

    return res.status(200).json({
      status: 1,
      message: "Fetched attendance summary successfully",
      payload: attSummary,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
