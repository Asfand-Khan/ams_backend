import { Attendance } from "@prisma/client";
import prisma from "../config/db";
import {
  ApproveRejectAttendanceCorrection,
  AttendanceCorrectionCreate,
  AttendanceCorrectionListing,
  SingleAttendanceCorrection,
} from "../validations/atttendanceCorrectionValidations";
import {
  addAttendance,
  getEmployeeShift,
  updateAttendance,
} from "./attendanceServices";
import { getCheckInStatus } from "../utils/getCheckInStatus";
import { getWorkStatus } from "../utils/getWorkStatusAndHours";

export const createAttendanceCorrection = async (
  data: AttendanceCorrectionCreate,
  attendance: Attendance | null
) => {
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
};

export const attendanceCorrectionListing = async (
  data: AttendanceCorrectionListing
) => {
  let whereClause = {} as any;

  if (data.status) {
    whereClause["status"] = data.status;
  }
  if (data.employee_id) {
    whereClause["employee_id"] = data.employee_id;
  }

  const correction = await prisma.attendanceCorrectionRequest.findMany({
    where: whereClause,
    include: {
      employee: {
        select: {
          full_name: true,
        },
      },
      reviewer: {
        select: {
          full_name: true,
        },
      },
    },
  });

  return correction;
};

export const attendanceCorrectionSingle = async (
  data: SingleAttendanceCorrection
) => {
  const correctionSingle = await prisma.attendanceCorrectionRequest.findUnique({
    where: {
      id: data.attendance_correction_id,
    },
    include: {
      employee: {
        select: {
          full_name: true,
        },
      },
      reviewer: {
        select: {
          full_name: true,
        },
      },
    },
  });

  return correctionSingle;
};

export const attendanceCorrectionRejectApprove = async (
  data: ApproveRejectAttendanceCorrection
) => {
  const result = await prisma.$transaction(async (tx) => {
    const correction = await tx.attendanceCorrectionRequest.findUnique({
      where: {
        id: data.attendance_correction_id,
      },
    });

    if (!correction) throw new Error("Attendance correction request not found");

    const attendance = await tx.attendance.findFirst({
      where: {
        employee_id: correction.employee_id,
        date: correction.attendance_date,
      },
    });

    return {
      correction,
      attendance,
    };
  });

  const { correction, attendance } = result;

  let updatedCorrection = null;
  if (data.status == "rejected") {
    updatedCorrection = await prisma.attendanceCorrectionRequest.update({
      where: {
        id: correction.id,
      },
      data: {
        status: data.status,
        remarks: data.remarks,
      },
    });
  } else {
    const shift = await getEmployeeShift(data.employee_id);
    if (!shift) {
      throw new Error("Shift not found");
    }

    let check_in_status = null;
    if (correction.requested_check_in) {
      check_in_status = await getCheckInStatus(
        correction.requested_check_in,
        shift.start_time,
        shift.grace_minutes
      );
    }

    let work_status = null;
    if (correction.requested_check_out) {
      work_status = await getWorkStatus(
        correction.requested_check_in
          ? correction.requested_check_in
          : correction.original_check_in,
        correction.requested_check_out
      );
    }

    if (attendance === null) {
      // Add Attendance Here
      await addAttendance(
        {
          employee_id: data.employee_id,
          attendance_date: correction.attendance_date,
          check_in_time: correction.requested_check_in,
          check_out_time: correction.requested_check_out,
        },
        work_status,
        check_in_status
      );
    } else {
      // Update Attendance Here
      console.log("Update attendance");
      console.log("work_status: ", work_status);
      await updateAttendance(
        {
          attendance_date: correction.attendance_date,
          attendance_id: attendance.id,
          check_in_time: correction.requested_check_in,
          check_out_time: correction.requested_check_out,
        },
        work_status,
        check_in_status
      );
    }

    updatedCorrection = await prisma.attendanceCorrectionRequest.update({
      where: {
        id: correction.id,
      },
      data: {
        status: data.status,
        remarks: data.remarks,
      },
    });
  }

  return updatedCorrection;
};
