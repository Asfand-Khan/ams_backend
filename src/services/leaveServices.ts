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
  try {
    let whereClause = {
      employee_id: data.employee_id,
    } as any;

    if (data.status) {
      whereClause["status"] = data.status;
    }

    const leaves = await prisma.leave.findMany({
      where: whereClause,
    });

    return leaves;
  } catch (error: any) {
    throw new Error(`Failed to fetch leaves: ${error.message}`);
  }
};

export const singleLeave = async (data: SingleLeave) => {
  try {
    const leave = await prisma.leave.findUnique({
      where: {
        id: data.leave_id,
      },
    });

    return leave;
  } catch (error: any) {
    throw new Error(`Failed to fetch single leave: ${error.message}`);
  }
};

export const leaveSummary = async (employee_id: number) => {
  try {
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
  } catch (error: any) {
    throw new Error(`Failed to create leave summary: ${error.message}`);
  }
};
