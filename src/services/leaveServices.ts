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
import { sendEmail } from "../utils/sendEmail";
import { getLeaveTemplate } from "../utils/getLeaveTemplate";
import { format } from "date-fns-tz";

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
      include: {
        leave_type: {
          select: {
            name: true,
          },
        },
        approver: {
          select: {
            full_name: true,
          },
        },
      },
    });

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
    const status = leave.status;
    const capitalizedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    for (const emp of employee) {
      await sendEmail({
        to: emp.employee_email,
        subject: `Orio Connect - Leave Request ${capitalizedStatus}`,
        cc: [emp.hr_email, emp.team_lead_email],
        html: getLeaveTemplate({
          status: leave.status,
          applied_on: format(leave.applied_on, "yyyy-MM-dd", {
            timeZone: "Asia/Karachi",
          }),
          name: emp.full_name,
          leave_type_name: leave.leave_type.name,
          reason: leave.reason ?? "",
          start_date: leave.start_date,
          end_date: leave.end_date,
          total_days: leave.total_days.toString(),
          remarks: leave.remarks ?? "",
          approved_on: leave.approved_on
            ? format(leave.approved_on, "yyyy-MM-dd", {
                timeZone: "Asia/Karachi",
              })
            : "",
          id: leave.id.toString(),
          approved_by_name: leave.approver ? leave.approver.full_name : "",
        }),
      });
    }

    return leave;
  } catch (error: any) {
    throw new Error(`Failed to create leave: ${error.message}`);
  }
};

export const allLeaves = async (data: LeaveListing, user: any) => {
  const whereConditions: string[] = [];
  const parameters: any[] = [];
  whereConditions.push("l.is_active = ?");
  whereConditions.push("l.is_deleted = ?");
  parameters.push(1, 0);
  if (data.status) {
    whereConditions.push(`l.status = ?`);
    parameters.push(data.status);
  }
  if (data.date) {
    whereConditions.push(`? BETWEEN l.start_date AND l.end_date`);
    parameters.push(data.date);
  }
  if (data.employee_id) {
    const employeeExists = await prisma.employee.findUnique({
      where: { id: data.employee_id },
      select: { id: true },
    });
    if (employeeExists) {
      whereConditions.push(`l.employee_id = ?`);
      parameters.push(data.employee_id);
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
      whereConditions.push(
        `l.employee_id IN (${employeeIds.map(() => "?").join(", ")})`
      );
      parameters.push(...employeeIds);
    }
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
      l.status AS STATUS,
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
  return (leaves as any[]).map((record) => ({
    ...record,
    leave_id: Number(record.leave_id),
    employee_id: Number(record.employee_id),
    leave_type_id: Number(record.leave_type_id),
    approved_by: record.approved_by ? Number(record.approved_by) : null,
    is_active: record.is_active ? 1 : 0,
    is_deleted: record.is_deleted ? 1 : 0,
  }));
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
  approved_by: number
) => {
  const leave = await prisma.leave.findUnique({
    where: {
      id: data.leave_id,
    },
  });

  if (!leave) {
    throw new Error("Leave not found");
  }

  let updatedLeave: any = null;

  // If leave is being rejected
  if (data.status === "rejected") {
    updatedLeave = await prisma.leave.update({
      where: { id: leave.id },
      data: {
        status: "rejected",
        remarks: data.remarks,
        approved_on: new Date(),
        approved_by: approved_by,
      },
      include: {
        approver: {
          select: {
            full_name: true,
          },
        },
        leave_type: {
          select: {
            name: true,
          },
        },
      },
    });
  } else {
    updatedLeave = await prisma.$transaction(
      async (tx) => {
        const currentYear = dayjs().tz("Asia/Karachi").year();
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
            year: currentYear,
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
            approved_by: approved_by,
          },
          include: {
            leave_type: {
              select: {
                name: true,
              },
            },
            approver: {
              select: {
                full_name: true,
              },
            },
          },
        });

        return approvedLeave;
      },
      {
        timeout: 30000, // 30 seconds
      }
    );
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
  const status = updatedLeave.status;
  const capitalizedStatus =
    status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  for (const emp of employee) {
    await sendEmail({
      to: emp.employee_email,
      subject: `Orio Connect - Leave Request ${capitalizedStatus}`,
      cc: [emp.hr_email, emp.team_lead_email],
      html: getLeaveTemplate({
        status: updatedLeave.status,
        applied_on: format(updatedLeave.applied_on, "yyyy-MM-dd", {
          timeZone: "Asia/Karachi",
        }),
        name: emp.full_name,
        leave_type_name: updatedLeave.leave_type.name,
        reason: updatedLeave.reason ?? "",
        start_date: updatedLeave.start_date,
        end_date: updatedLeave.end_date,
        total_days: updatedLeave.total_days.toString(),
        remarks: updatedLeave.remarks ?? "",
        approved_on: updatedLeave.approved_on
          ? format(updatedLeave.approved_on, "yyyy-MM-dd", {
              timeZone: "Asia/Karachi",
            })
          : "",
        id: updatedLeave.id.toString(),
        approved_by_name: updatedLeave.approver
          ? updatedLeave.approver.full_name
          : "",
      }),
    });
  }

  return updatedLeave;
};

export const employeeLeaveSummary = async (employee_id: number) => {
  const result: any = await prisma.$queryRaw`
    SELECT
        e.full_name,

        SUM(CASE WHEN lt.NAME = 'Annual' THEN elq.used_days ELSE 0 END) AS annual_used,
        SUM(CASE WHEN lt.NAME = 'Annual' THEN lt.total_quota ELSE 0 END) AS annual_total,
        SUM(CASE WHEN lt.NAME = 'Annual' THEN (lt.total_quota - elq.used_days) ELSE 0 END) AS annual_remaining,

        SUM(CASE WHEN lt.NAME = 'Sick' THEN elq.used_days ELSE 0 END) AS sick_used,
        SUM(CASE WHEN lt.NAME = 'Sick' THEN lt.total_quota ELSE 0 END) AS sick_total,
        SUM(CASE WHEN lt.NAME = 'Sick' THEN (lt.total_quota - elq.used_days) ELSE 0 END) AS sick_remaining,

        SUM(CASE WHEN lt.NAME = 'Casual' THEN elq.used_days ELSE 0 END) AS casual_used,
        SUM(CASE WHEN lt.NAME = 'Casual' THEN lt.total_quota ELSE 0 END) AS casual_total,
        SUM(CASE WHEN lt.NAME = 'Casual' THEN (lt.total_quota - elq.used_days) ELSE 0 END) AS casual_remaining

    FROM EmployeeLeaveQuota elq
    JOIN LeaveType lt ON elq.leave_type_id = lt.id
    JOIN Employee e ON elq.employee_id = e.id

    WHERE elq.YEAR = YEAR(CURDATE())
      AND elq.is_active = 1
      AND elq.is_deleted = 0
      AND elq.employee_id = ${employee_id}

    GROUP BY e.full_name;
  `;

  if (!result || result.length === 0) return null;

  const row = result[0];

  // BigInt safe serialization
  const serialize = (val: any) => (typeof val === "bigint" ? Number(val) : val);

  return {
    full_name: row.full_name,

    annual: {
      used: serialize(row.annual_used),
      total: serialize(row.annual_total),
      remaining: serialize(row.annual_remaining),
    },

    sick: {
      used: serialize(row.sick_used),
      total: serialize(row.sick_total),
      remaining: serialize(row.sick_remaining),
    },

    casual: {
      used: serialize(row.casual_used),
      total: serialize(row.casual_total),
      remaining: serialize(row.casual_remaining),
    },
  };
};

export const getEmployeeLeaveDetails = async (employeeId?: number) => {
  const result: any = await prisma.$queryRaw`
    SELECT 
        e.id AS employee_id,
        e.full_name,

         COALESCE(
        GROUP_CONCAT(
            CASE 
                WHEN lt.name = 'Annual' 
                THEN CONCAT(
                    UPPER(DATE_FORMAT(l.start_date, '%d-%b-%Y')), ' to ', 
                    UPPER(DATE_FORMAT(l.end_date, '%d-%b-%Y')), 
                    ' (', DATEDIFF(l.end_date, l.start_date)+1, ' days)'
                )
            END
            ORDER BY l.start_date
            SEPARATOR '\n'
        ), 'No Annual Leave'
    ) AS annual_leaves,

    COALESCE(
        GROUP_CONCAT(
            CASE 
                WHEN lt.name = 'Sick' 
                THEN CONCAT(
                    UPPER(DATE_FORMAT(l.start_date, '%d-%b-%Y')), ' to ', 
                    UPPER(DATE_FORMAT(l.end_date, '%d-%b-%Y')), 
                    ' (', DATEDIFF(l.end_date, l.start_date)+1, ' days)'
                )
            END
            ORDER BY l.start_date
            SEPARATOR '\n'
        ), 'No Sick Leave'
    ) AS sick_leaves,

    COALESCE(
        GROUP_CONCAT(
            CASE 
                WHEN lt.name = 'Casual' 
                THEN CONCAT(
                    UPPER(DATE_FORMAT(l.start_date, '%d-%b-%Y')), ' to ', 
                    UPPER(DATE_FORMAT(l.end_date, '%d-%b-%Y')), 
                    ' (', DATEDIFF(l.end_date, l.start_date)+1, ' days)'
                )
            END
            ORDER BY l.start_date
            SEPARATOR '\n'
        ), 'No Casual Leave'
    ) AS casual_leaves

    FROM \`Leave\` l
    JOIN Employee e ON l.employee_id = e.id
    JOIN LeaveType lt ON l.leave_type_id = lt.id
    WHERE l.status = 'approved'
    AND e.id = ${employeeId}
    AND YEAR(l.created_at) = YEAR(CURDATE())
    GROUP BY e.id, e.full_name
    ORDER BY e.full_name;
  `;

  if (!result || result.length === 0) return [];
  return result.map((row: any) => ({
    employee_id: row.employee_id,
    full_name: row.full_name,
    annual: row.annual_leaves.split("\n"),
    sick: row.sick_leaves.split("\n"),
    casual: row.casual_leaves.split("\n"),
  }));
};
