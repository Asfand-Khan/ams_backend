import prisma from "../config/db";
import dayjs from "dayjs";
import {
  ApproveRejectLeave,
  Leave,
  LeaveListing,
  SingleLeave,
} from "../validations/leaveValidations";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

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
  const whereConditions: string[] = [];
  const parameters: any[] = [];

  // Base conditions (always applied)
  whereConditions.push("l.is_active = 1");
  whereConditions.push("l.is_deleted = 0");

  // Optional filters
  if (data.employee_id) {
    whereConditions.push(`l.employee_id = ?`);
    parameters.push(data.employee_id);
  }

  if (data.status) {
    whereConditions.push(`l.status = ?`);
    parameters.push(data.status);
  }

  if (data.date) {
    // For date filtering, check if provided date is between start_date and end_date
    whereConditions.push(`? BETWEEN DATE(l.created_at) AND DATE(l.created_at)`);
    parameters.push(data.date);
  }

  const whereClause =
    whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const query = `
    SELECT
      l.id AS leave_id,
      l.employee_id,
      emp.full_name,
      l.leave_type_id,
      lt.NAME AS leave_type_name,
      l.start_date,
      l.end_date,
      l.total_days,
      l.reason,
      l.STATUS,
      l.applied_on,
      l.approved_by,
      approver.full_name AS approver,
      l.approved_on,
      l.remarks,
      l.is_active,
      l.is_deleted,
      l.created_at,
      l.updated_at 
    FROM \`Leave\` l
    LEFT JOIN LeaveType lt ON l.leave_type_id = lt.id
    LEFT JOIN Employee emp ON l.employee_id = emp.id
    LEFT JOIN Employee approver ON l.approved_by = approver.id
    ${whereClause}
    ORDER BY l.created_at DESC
  `;

  const leaves = await prisma.$queryRawUnsafe(query, ...parameters);
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

export const leaveRejectApprove = async (
  data: ApproveRejectLeave,
  approved_by: number | null
) => {
  const leave = await prisma.leave.findUnique({
    where: {
      id: data.leave_id,
    },
  });

  if (!leave) {
    throw new Error("Leave not found");
  }

  if (data.status === "rejected") {
    return prisma.leave.update({
      where: { id: leave.id },
      data: {
        status: "rejected",
        remarks: data.remarks,
        approved_on: new Date(),
        approved_by: approved_by ?? null,
      },
    });
  }

  // If leave is being approved
  const updatedLeave = await prisma.$transaction(
    async (tx) => {
      const start = dayjs(leave.start_date).tz("Asia/Karachi").startOf("day");
      const end = dayjs(leave.end_date).tz("Asia/Karachi").startOf("day");
      const leaveDays = end.diff(start, "day") + 1;

      for (let i = 0; i < leaveDays; i++) {
        const day = start.add(i, "day").format("YYYY-MM-DD");

        await tx.attendance.upsert({
          where: {
            employee_id_date: {
              employee_id: data.employee_id,
              date: day,
            },
          },
          update: {
            day_status: "leave",
          },
          create: {
            employee_id: data.employee_id,
            date: day,
            day_status: "leave",
          },
        });
      }

      const quota = await tx.employeeLeaveQuota.findFirst({
        where: {
          employee_id: data.employee_id,
          leave_type_id: leave.leave_type_id,
        },
      });

      if (quota) {
        await tx.employeeLeaveQuota.update({
          where: { id: quota.id },
          data: { used_days: quota.used_days + leaveDays },
        });
      }

      const approvedLeave = await tx.leave.update({
        where: { id: leave.id },
        data: {
          status: "approved",
          remarks: data.remarks,
          approved_on: new Date(),
          approved_by: approved_by ?? null,
        },
      });

      return approvedLeave;
    },
    {
      timeout: 30000, // 30 seconds
    }
  );

  return updatedLeave;
};
