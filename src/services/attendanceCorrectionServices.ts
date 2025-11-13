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
import { sendEmail } from "../utils/sendEmail";
import { getEmployeeByEmail, getEmployeeById } from "./employeeServices";
import {
  getAttendanceCorrectionRequestTemplate,
} from "../utils/attendanceCorrectionRequestTemplate";
import { format } from "date-fns-tz";

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

  const employee = (await prisma.$queryRaw`
    SELECT
      emp.full_name,
	    emp.id,
  	  emp.email AS 'employee_email',
	    tl.email AS 'team_lead_email',
	    (SELECT email FROM User u WHERE u.type = 'hr') AS 'hr_email'
    FROM
	    Employee emp
	  LEFT JOIN TeamMember tm ON emp.id = tm.employee_id
	  LEFT JOIN Team t ON t.id = tm.team_id
	  LEFT JOIN Employee tl ON t.team_lead_id = tl.id
    WHERE
	  emp.id = ${data.employee_id};
  `) as {
    id: number;
    full_name: string;
    employee_email: string;
    team_lead_email: string;
    hr_email: string;
  }[];

  if (employee.length === 0) throw new Error("Employee not found");

  for (const emp of employee) {
    await sendEmail({
      to: emp.employee_email,
      subject: `Orio Connect - Attendance Correction Request`,
      cc: emp.hr_email,
      bcc: emp.team_lead_email,
      html: getAttendanceCorrectionRequestTemplate({
        full_name : emp.full_name,
        attendance_date: data.attendance_date,
        reason: data.reason,
        request_type: data.request_type,
        id: correction.id.toString(),
        original_check_in: correction.original_check_in,
        original_check_out: correction.original_check_out,
        requested_check_in: correction.requested_check_in,
        requested_check_out: correction.requested_check_out,
        status: correction.status,
        created_at: format(correction.created_at, "yyyy-MM-dd HH:mm:ss"),
        year: new Date().getFullYear().toString(),
      }),
    });
  }

  return correction;
};

export const attendanceCorrectionListing = async (
  data: AttendanceCorrectionListing,
  user: any
) => {
  // Base where clause
  let whereClause: any = {};
  if (data.status) {
    whereClause["status"] = data.status;
  }
  if (data.date) {
    const inputDate = new Date(data.date);
    const startOfDay = new Date(inputDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(inputDate.setHours(23, 59, 59, 999));

    whereClause["created_at"] = {
      gte: startOfDay,
      lte: endOfDay,
    };
  }
  if (data.employee_id) {
    const employeeExists = await prisma.employee.findUnique({
      where: { id: data.employee_id },
      select: { id: true },
    });

    if (employeeExists) {
      whereClause["employee_id"] = data.employee_id;
    } else {
      return []; 
    }
  } else {
    const userRecord = await prisma.user.findFirst({
      where: { employee_id: user.id },
      select: { type: true },
    });

    if (!userRecord) {
      throw new Error("User not found");
    }

    const userType = userRecord.type;

    if (userType === "lead") {
      const teamMembers = await prisma.teamMember.findMany({
        where: {
          team: {
            team_lead_id: user.id,
          },
          is_active: true,
          is_deleted: false,
        },
        select: {
          employee_id: true,
        },
      });

      const employeeIds = teamMembers.map((member) => member.employee_id);

      if (employeeIds.length === 0) {
        return []; 
      }

      // Restrict to team members
      whereClause["employee_id"] = {
        in: employeeIds,
      };
    }
     if (userType === "employee") {
    whereClause.employee_id = user.id;
  } 
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
    orderBy: { created_at: "desc" },
  });
  return correction.map((record) => ({
    ...record,
    id: record.id,
    employee_id: record.employee_id,
    reviewed_by: record.reviewed_by ? record.reviewed_by : null,
  }));
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
  data: ApproveRejectAttendanceCorrection,
  reviewed_by: number
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
        reviewed_on: new Date(),
        reviewed_by: reviewed_by ,
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
        check_in_status,
        correction.request_type === "work_from_home" ? true : false
      );
    } else {
      // Update Attendance Here
      await updateAttendance(
        {
          attendance_date: correction.attendance_date,
          attendance_id: attendance.id,
          check_in_time: correction.requested_check_in,
          check_out_time: correction.requested_check_out,
        },
        work_status,
        check_in_status,
        correction.request_type === "work_from_home" ? true : false
      );
    }

    updatedCorrection = await prisma.attendanceCorrectionRequest.update({
      where: {
        id: correction.id,
      },
      data: {
        status: data.status,
        remarks: data.remarks,
        reviewed_on: new Date(),
        reviewed_by: reviewed_by,
      },
    });
  }

  const employee = (await prisma.$queryRaw`
    SELECT
	    emp.id,
      emp.full_name,
  	  emp.email AS 'employee_email',
	    tl.email AS 'team_lead_email',
	    (SELECT email FROM User u WHERE u.type = 'hr') AS 'hr_email'
    FROM
	    Employee emp
	  LEFT JOIN TeamMember tm ON emp.id = tm.employee_id
	  LEFT JOIN Team t ON t.id = tm.team_id
	  LEFT JOIN Employee tl ON t.team_lead_id = tl.id
    WHERE
	  emp.id = ${data.employee_id};
  `) as {
    id: number;
    employee_email: string;
    team_lead_email: string;
    hr_email: string;
    full_name: string;
  }[];

  if (employee.length === 0) throw new Error("Employee not found");

  for (const emp of employee) {
    await sendEmail({
      to: emp.employee_email,
      subject: `ORIO CONNECT - Attendance Correction ${updatedCorrection.status.toUpperCase()}`,
      cc: emp.hr_email,
      bcc: emp.team_lead_email,
      html: getAttendanceCorrectionRequestTemplate({
        attendance_date: updatedCorrection.attendance_date,
        reason: updatedCorrection.reason,
        request_type: updatedCorrection.request_type,
        id: updatedCorrection.id.toString(),
        original_check_in: updatedCorrection.original_check_in,
        original_check_out: updatedCorrection.original_check_out,
        requested_check_in: updatedCorrection.requested_check_in,
        requested_check_out: updatedCorrection.requested_check_out,
        status: updatedCorrection.status,
        created_at: format(updatedCorrection.created_at, "yyyy-MM-dd HH:mm:ss"),
        year: new Date().getFullYear().toString(),
        full_name: emp.full_name,
      }),
    });
  }

  return updatedCorrection;
};
