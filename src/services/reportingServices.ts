import { Prisma } from "@prisma/client";
import prisma from "../config/db";
import { OverallAttendanceSummary } from "../validations/reportingValidations";
import { secondsToHHMMSS } from "./attendanceServices";

export const getOverallAttendanceSummaryReport = async (
  data: OverallAttendanceSummary,
   user: any
) => {

  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }

  const userType = userRecord.type;
  if (userType === "employee") {
    return [];
  }
  let employeeIds: number[] = [];

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

    employeeIds = teamMembers.map((m) => m.employee_id);
    if (employeeIds.length === 0) return [];
  }

  const query = `
        WITH RECURSIVE DateRange AS (
            SELECT DATE('${data.start_date}') AS date
            UNION ALL
            SELECT DATE_ADD(date, INTERVAL 1 DAY)
            FROM DateRange
            WHERE date < '${data.end_date}'
        ),
        EmployeeDate AS (
            SELECT 
                e.id AS employee_id,
                e.full_name,
                e.department_id,
                d.name AS department_name,
                des.title AS designation_title,
                dr.date
            FROM Employee e
            JOIN Department d ON e.department_id = d.id
            JOIN Designation des ON e.designation_id = des.id
            CROSS JOIN DateRange dr
            WHERE e.status = 'active' AND e.is_deleted = 0 AND e.department_id != 1
             AND dr.date >= e.join_date
              ${employeeIds.length > 0 ? `AND e.id IN (${employeeIds.join(",")})` : ""}
        )
        SELECT 
            ed.employee_id,
            ed.full_name AS employee_name,
            ed.department_name,
            ed.designation_title,
            CAST(COUNT(*) AS CHAR) AS total_days,
            SUM(
            CASE 
                WHEN 
                (
                    (ed.department_id IN (4,5) AND DAYOFWEEK(ed.date) != 1)
                    OR (ed.department_id NOT IN (4,5) AND DAYOFWEEK(ed.date) NOT IN (1,7))
                )
                AND h.holiday_date IS NULL
                THEN 1 ELSE 0 
            END
            ) AS working_days,
            SUM(CASE WHEN a.day_status IN ('present','work_from_home') THEN 1 ELSE 0 END) AS present_days,
            SUM(CASE WHEN COALESCE(a.day_status, 'absent') = 'absent' THEN 1 ELSE 0 END) AS absent_days,
            SUM(CASE WHEN a.day_status = 'leave' THEN 1 ELSE 0 END) AS leave_days,
            SUM(
            CASE 
                WHEN 
                (ed.department_id IN (4,5) AND DAYOFWEEK(ed.date) = 1)
                OR (ed.department_id NOT IN (4,5) AND DAYOFWEEK(ed.date) IN (1,7))
                THEN 1 ELSE 0 
            END
            ) AS weekend_days,
            SUM(
            CASE 
                WHEN 
                a.day_status IN ('present', 'work_from_home')
                AND (
                    (ed.department_id IN (4,5) AND DAYOFWEEK(ed.date) = 1)
                    OR (ed.department_id NOT IN (4,5) AND DAYOFWEEK(ed.date) IN (1,7))
                )
                THEN 1 ELSE 0 
            END
            ) AS weekend_attendance_days,
            SUM(CASE WHEN a.day_status = 'holiday' OR h.holiday_date IS NOT NULL THEN 1 ELSE 0 END) AS holiday_days,
            SUM(CASE WHEN a.day_status = 'work_from_home' THEN 1 ELSE 0 END) AS work_from_home_days,
            SUM(CASE WHEN a.check_in_status = 'on_time' THEN 1 ELSE 0 END) AS on_time_check_ins,
            SUM(CASE WHEN a.check_in_status = 'late' THEN 1 ELSE 0 END) AS late_check_ins,
            SUM(CASE WHEN a.check_in_status = 'manual' THEN 1 ELSE 0 END) AS manual_check_ins,
            SUM(CASE WHEN a.check_out_status = 'on_time' THEN 1 ELSE 0 END) AS on_time_check_outs,
            SUM(CASE WHEN a.check_out_status = 'early_leave' THEN 1 ELSE 0 END) AS early_leave_check_outs,
            SUM(CASE WHEN a.check_out_status = 'early_go' THEN 1 ELSE 0 END) AS early_go_check_outs,
            SUM(CASE WHEN a.check_out_status = 'overtime' THEN 1 ELSE 0 END) AS overtime_check_outs,
            SUM(CASE WHEN a.check_out_status = 'half_day' THEN 1 ELSE 0 END) AS half_day_check_outs,
            SUM(CASE WHEN a.check_out_status = 'manual' THEN 1 ELSE 0 END) AS manual_check_outs,
            COALESCE(SUM(
                CASE 
                    WHEN a.day_status IN ('present', 'work_from_home') 
                AND a.work_hours REGEXP '^[0-9]{2}:[0-9]{2}:[0-9]{2}$'
                    THEN TIME_TO_SEC(a.work_hours)
                    ELSE 0
                END
            ), 0) AS actual_work_seconds,
            SUM(
                CASE 
                    WHEN 
                    (
                        (ed.department_id IN (4,5) AND DAYOFWEEK(ed.date) != 1)
                        OR (ed.department_id NOT IN (4,5) AND DAYOFWEEK(ed.date) NOT IN (1,7))
                    )
                    AND h.holiday_date IS NULL 
                    AND a.day_status != 'leave'
                    THEN 8
                    ELSE 0 
                END
            ) AS expected_work_hours
            FROM EmployeeDate ed
            LEFT JOIN Attendance a 
                ON ed.employee_id = a.employee_id 
                AND ed.date = a.date
                AND a.is_active = 1 AND a.is_deleted = 0
            LEFT JOIN Holiday h 
                ON ed.date = h.holiday_date 
                AND h.is_active = 1 AND h.is_deleted = 0
            GROUP BY 
                ed.employee_id, ed.full_name, ed.department_name, ed.designation_title
            ORDER BY 
                ed.employee_id;
      `;

  const summary = (await prisma.$queryRawUnsafe(query)) as any[];

  return summary.map((row: any) => ({
    ...row,
    actual_work_hours: secondsToHHMMSS(row.actual_work_seconds),
  }));
};

export const getAttendanceDetail = async (data: OverallAttendanceSummary, user: any) => {
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }

  const userType = userRecord.type;
  if (userType === "employee") {
    return [];
  }

  let employeeIds: number[] = [];

  if (userType === "lead") {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: { team_lead_id: user.id },
        is_active: true,
        is_deleted: false,
      },
      select: { employee_id: true },
    });

    employeeIds = teamMembers.map((m) => m.employee_id);
    if (employeeIds.length === 0) return [];
  }
  const employeeFilter =
    employeeIds.length > 0
      ? Prisma.sql`AND emp.id IN (${Prisma.join(employeeIds)})`
      : Prisma.sql``; // empty SQL fragment when no IDs

  const query = Prisma.sql`
    WITH RECURSIVE date_series AS (
      SELECT DATE(${data.start_date}) AS date
      UNION ALL
      SELECT DATE_ADD(date, INTERVAL 1 DAY)
      FROM date_series
      WHERE date < DATE(${data.end_date})
    )
    SELECT
        emp.id AS employee_id,
        emp.employee_code,
        emp.full_name,
        CAST(DATE(d.date) AS CHAR) AS date,
        att.check_in_time,
        att.check_out_time,
        att.check_in_status,
        att.check_out_status,
        att.day_status,
        att.work_hours,
        o1.name AS check_in_office,
        o2.name AS check_out_office
    FROM
        date_series d
      CROSS JOIN Employee emp
      LEFT JOIN Attendance att ON emp.id = att.employee_id AND att.date = d.date
      LEFT JOIN OfficeLocation o1 ON att.check_in_office_id = o1.id
      LEFT JOIN OfficeLocation o2 ON att.check_out_office_id = o2.id
    WHERE
        emp.status = 'active'
        AND emp.is_deleted = 0
        AND emp.department_id != 1
        ${employeeFilter}
     ORDER BY
        emp.id ASC,
        d.date ASC
  `;

  const attendance = await prisma.$queryRaw(query);

  return attendance;
};