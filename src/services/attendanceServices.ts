import dayjs from "dayjs";
import prisma from "../config/db";
import { CheckIn } from "../validations/attendanceValidations";

export const getEmployeeShift = async (emp_id: number) => {
  try {
    const employeeShift =
      (await prisma.$queryRaw`SELECT s.* FROM EmployeeShift es LEFT JOIN Shift s ON es.shift_id = s.id WHERE es.employee_id = ${emp_id}`) as any;
    return employeeShift[0];
  } catch (error: any) {
    throw new Error(`Failed to fetch employee shift: ${error.message}`);
  }
};

export const ifCheckInExists = async (
  emp_id: number, // 12
  attendance_date: string // 2025-07-15 09:00:00
) => {
  const checkInExists =
    (await prisma.$queryRaw`SELECT COUNT(*) as cnt FROM Attendance WHERE employee_id = ${emp_id} AND date = ${
      attendance_date.split(" ")[0]
    }`) as [{ cnt: number }];
  return Number(checkInExists[0].cnt) || null;
};

export const markCheckIn = async (
  data: CheckIn,
  checkInStatus: "on_time" | "late"
) => {
  try {
    const attendance = await prisma.attendance.create({
      data: {
        employee_id: data.employee_id,
        date: new Date(data.attendance_date),
        check_in_time: new Date(data.check_in_time),
        check_in_status: checkInStatus,
        check_in_office_id: data.check_in_office_location,
      },
    });
    return attendance;
  } catch (error: any) {
    throw new Error(`Failed to mark check-in: ${error.message}`);
  }
};

export const getEmployeeAttendance = async (emp_id: number, date: string) => {
  try {
    const employeeAttendance =
      (await prisma.$queryRaw`SELECT * FROM Attendance WHERE employee_id = ${emp_id} AND date = ${
        date.split(" ")[0]
      }`) as any;
    return employeeAttendance[0] as { check_in_time: string; date: string };
  } catch (error: any) {
    throw new Error(`Failed to fetch employee attendance: ${error.message}`);
  }
};
