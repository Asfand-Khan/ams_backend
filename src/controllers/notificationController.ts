import { Request, Response } from "express";
import { z } from "zod";
import {
  attendanceSchema,
  attendanceSummarySchema,
  checkInSchema,
  checkOutSchema,
  createAttendanceSchema,
  singleAttendanceSchema,
  updateAttendanceSchema,
} from "../validations/attendanceValidations";
import { getEmployeeById } from "../services/employeeServices";
import {
  addAttendance,
  attendanceById,
  attendanceSummary,
  getAttendance,
  getDayStatus,
  getEmployeeAttendance,
  getEmployeeShift,
  ifCheckInExists,
  markCheckIn,
  markCheckOut,
  singleAttendance,
  updateAttendance,
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