import { Attendance } from "@prisma/client";
import prisma from "../config/db";
import {
  AttendanceCorrectionCreate,
  AttendanceCorrectionListing,
  SingleAttendanceCorrection,
} from "../validations/atttendanceCorrectionValidations";

export const createAttendanceCorrection = async (
  data: AttendanceCorrectionCreate,
  attendance: Attendance | null
) => {
  try {
    const correction = await prisma.attendanceCorrectionRequest.create({
      data: {
        attendance_date: data.attendance_date,
        reason: data.reason,
        request_type: data.request_type,
        employee_id: data.employee_id,
        requested_check_in: data.requested_check_in_time,
        requested_check_out: data.requested_check_out_time,
        original_check_in: attendance ? attendance.check_in_time : null,
        original_check_out: attendance ? attendance.check_out_time : null,
      },
    });

    return correction;
  } catch (error: any) {
    throw new Error(`Failed to create attendance correction: ${error.message}`);
  }
};

export const attendanceCorrectionListing = async (
  data: AttendanceCorrectionListing
) => {
  try {
    let whereClause = {} as any;

    if (data.status) {
      whereClause["status"] = data.status;
    }
    if (data.employee_id) {
      whereClause["employee_id"] = data.employee_id;
    }

    const correction = await prisma.attendanceCorrectionRequest.findMany({
      where: whereClause,
      include:{
        employee:{
          select:{
            full_name: true
          }
        },
        reviewer:{
          select:{
            full_name: true
          }
        }
      },
    });

    return correction;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch attendance correction listing: ${error.message}`
    );
  }
};

export const attendanceCorrectionSingle = async (
  data: SingleAttendanceCorrection
) => {
  try {
    const correctionSingle =
      await prisma.attendanceCorrectionRequest.findUnique({
        where: {
          id: data.attendance_correction_id,
        },
      });

    return correctionSingle;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch single attendance correction: ${error.message}`
    );
  }
};
