import { Request, Response } from "express";
import { z } from "zod";
import {
  checkInSchema,
  checkOutSchema,
} from "../validations/attendanceValidations";
import { getEmployeeById } from "../services/employeeServices";
import {
  getEmployeeAttendance,
  getEmployeeShift,
  ifCheckInExists,
  markCheckIn,
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

    const ifAttendanceExists = await ifCheckInExists(
      employee.id,
      parsedData.attendance_date
    );

    if (ifAttendanceExists !== null) {
      throw new Error("Attendance already exists");
    }

    const shift: {
      start_time: string;
      grace_minutes: number;
    } = await getEmployeeShift(parsedData.employee_id);

    const checkInStatus = await getCheckInStatus({
      check_in_datetime: parsedData.check_in_time,
      system_start_time: shift.start_time,
      grace_minutes: shift.grace_minutes,
    });

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

    console.log(new Date("2025-07-15T04:19:00.000Z"));

    const work_status =await getWorkStatus({
      check_in_time: attendance.check_in_time,
      check_out_time: parsedData.check_out_time,
    });

    console.log(work_status);

    // const checkInStatus = await getCheckInStatus({
    //   check_in_datetime: parsedData.check_in_time,
    //   system_start_time: shift.start_time,
    //   grace_minutes: shift.grace_minutes,
    // });

    // const attendance = await markCheckIn(parsedData, checkInStatus);

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
