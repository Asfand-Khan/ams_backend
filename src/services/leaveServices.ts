import prisma from "../config/db";
import dayjs from "dayjs";
import {
  Leave,
  LeaveListing,
  SingleLeave,
} from "../validations/leaveValidations";

export const calculateDays = (startDate: string, endDate: string): number => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  if (!start.isValid() || !end.isValid()) {
    throw new Error("Invalid date format. Expected YYYY-MM-DD");
  }

  const diff = end.diff(start, "day");

  return diff >= 0 ? diff + 1 : 1;
};

export const createLeave = async (data: Leave, days: number) => {
  try {
    const leave = await prisma.leave.create({
      data: {
        employee_id: data.employee_id,
        start_date: data.start_date,
        end_date: data.end_date,
        reason: data.reason,
        leave_type_id: data.leave_type_id,
        total_days: days,
      },
    });

    return leave;
  } catch (error: any) {
    throw new Error(`Failed to create leave: ${error.message}`);
  }
};

export const allLeaves = async (data: LeaveListing) => {
  let leaves = null;
  if (data.employee_id) {
    leaves = await prisma.$queryRaw`
        SELECT
	        l.id AS leave_id,
	        l.employee_id,
	        l.leave_type_id,
	        lt.NAME AS leave_type_name,
	        l.start_date,
	        l.end_date,
	        l.total_days,
	        l.reason,
	        l.STATUS,
	        l.applied_on,
	        l.approved_by,
	        l.approved_on,
	        l.remarks,
	        l.is_active,
	        l.is_deleted,
	        l.created_at,
	        l.updated_at 
        FROM
	        \`Leave\` l
	      LEFT JOIN LeaveType lt ON l.leave_type_id = lt.id 
        WHERE
	        l.is_active = 1 
	      AND l.is_deleted = 0 
	      AND l.employee_id = ${data.employee_id}   
    `;
  } else {
    leaves = await prisma.$queryRaw`
        SELECT
	        l.id AS leave_id,
	        l.employee_id,
	        l.leave_type_id,
	        lt.NAME AS leave_type_name,
	        l.start_date,
	        l.end_date,
	        l.total_days,
	        l.reason,
	        l.STATUS,
	        l.applied_on,
	        l.approved_by,
	        l.approved_on,
	        l.remarks,
	        l.is_active,
	        l.is_deleted,
	        l.created_at,
	        l.updated_at 
        FROM
	        \`Leave\` l
	      LEFT JOIN LeaveType lt ON l.leave_type_id = lt.id 
        WHERE
	        l.is_active = 1 
	      AND l.is_deleted = 0 
    `;
  }
  return leaves;
};

export const singleLeave = async (data: SingleLeave) => {
  const leave = await prisma.leave.findUnique({
    where: {
      id: data.leave_id,
    },
  });

  return leave;
};

export const leaveSummary = async (employee_id: number) => {
  const leaveSummary: any = await prisma.$queryRaw`
      SELECT
        lt.NAME AS leave_type,
        elq.used_days,
        lt.total_quota,
        (lt.total_quota - elq.used_days) AS remaining 
      FROM
        EmployeeLeaveQuota elq
        JOIN LeaveType lt ON elq.leave_type_id = lt.id 
      WHERE
        elq.employee_id = ${employee_id} 
        AND elq.YEAR = YEAR (CURDATE()) 
        AND elq.is_active = 1 
        AND elq.is_deleted = 0;
    `;

  // Convert BigInt fields to numbers or strings
  const serializedSummary = leaveSummary.map((record: any) => ({
    leave_type: record.leave_type,
    used_days:
      typeof record.used_days === "bigint"
        ? Number(record.used_days)
        : record.used_days,
    total_quota:
      typeof record.total_quota === "bigint"
        ? Number(record.total_quota)
        : record.total_quota,
    remaining:
      typeof record.remaining === "bigint"
        ? Number(record.remaining)
        : record.remaining,
  }));

  return serializedSummary;
};
