import prisma from "../config/db";
import {
  Attendance,
  AttendanceByDate,
  CheckIn,
  CreateAttendance,
  UpdateAttendance,
} from "../validations/attendanceValidations";

type WorkStatus =
  | "early_leave"
  | "half_day"
  | "early_go"
  | "on_time"
  | "overtime";

export function secondsToHHMMSS(seconds: number): string {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export const getEmployeeShift = async (employee_id: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const employeeShift = await tx.employeeShift.findFirst({
      where: { employee_id },
    });

    if (!employeeShift) return null;

    const shift = await tx.shift.findUnique({
      where: {
        id: employeeShift.shift_id,
      },
    });

    return shift;
  });

  return result;
};

export const ifCheckInExists = async (
  employee_id: number, // 12
  date: string // 2025-07-15
) => {
  const attendance = await prisma.attendance.findFirst({
    where: {
      employee_id,
      date,
    },
  });
  return attendance;
};

export const markCheckIn = async (
  data: CheckIn,
  checkInStatus: "on_time" | "late"
) => {
  const attendance = await prisma.attendance.create({
    data: {
      employee_id: data.employee_id,
      date: data.attendance_date,
      check_in_time: data.check_in_time,
      check_in_status: checkInStatus,
      check_in_office_id: data.check_in_office_location,
    },
  });
  return attendance;
};

export const getEmployeeAttendance = async (
  employee_id: number,
  date: string
) => {
  const employeeAttendance = await prisma.attendance.findFirst({
    where: {
      employee_id,
      date,
    },
  });
  return employeeAttendance;
};

export const markCheckOut = async (data: {
  check_out_time: string;
  checkoutStatus: WorkStatus;
  check_out_office_location: number;
  workingHours: string;
  employee_id: number;
  attendance_date: string;
  attendance_id: number;
}) => {
  const attendance = await prisma.attendance.update({
    where: { id: data.attendance_id },
    data: {
      check_out_time: data.check_out_time,
      check_out_status: data.checkoutStatus,
      check_out_office_id: data.check_out_office_location,
      work_hours: data.workingHours,
    },
  });
  return attendance;
};

export const singleAttendance = async (employee_id: number, date: string) => {
  const attendance = await prisma.attendance.findFirst({
    where: {
      employee_id,
      date,
    },
  });
  return attendance;
};

export const attendanceSummary = async (
  employee_id: number,
  start_date: string,
  end_date: string
) => {
  const query = `
SELECT 
  a.employee_id,
  SUM(CASE WHEN a.day_status NOT IN ('weekend', 'holiday') THEN 1 ELSE 0 END) AS total_days,
  SUM(CASE WHEN a.day_status NOT IN ('weekend', 'holiday') THEN 1 ELSE 0 END) AS working_days,
  SUM(CASE WHEN a.day_status = 'present' THEN 1 ELSE 0 END) AS present_days,
  SUM(CASE WHEN a.day_status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
  SUM(CASE WHEN a.day_status = 'leave' THEN 1 ELSE 0 END) AS leave_days,
  SUM(CASE WHEN a.day_status = 'weekend' THEN 1 ELSE 0 END) AS weekend_days,
  SUM(CASE WHEN a.day_status = 'holiday' THEN 1 ELSE 0 END) AS holiday_days,
  SUM(CASE WHEN a.day_status = 'manual_present' THEN 1 ELSE 0 END) AS manual_present_days,
  SUM(CASE WHEN a.day_status = 'work_from_home' THEN 1 ELSE 0 END) AS work_from_home_days,
  SUM(CASE WHEN a.check_in_status = 'late' THEN 1 ELSE 0 END) AS late_check_ins,
  SUM(CASE WHEN a.check_out_status = 'half_day' THEN 1 ELSE 0 END) AS half_day_check_outs,
  SUM(CASE WHEN a.check_out_status = 'early_leave' THEN 1 ELSE 0 END) AS early_leave_check_outs
FROM
  Attendance a
WHERE 
  a.employee_id = ${employee_id}
  AND DATE(a.date) BETWEEN '${start_date}' AND '${end_date}'
GROUP BY 
  a.employee_id;
`;

  const attendanceSummary = await prisma.$queryRawUnsafe(query);
  return attendanceSummary;
};

export const getAttendance = async (data: Attendance) => {
  const attendance = await prisma.$queryRaw`
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
	          d.date,
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
	          emp.id = ${data.employee_id}
          ORDER BY
	          d.date DESC;
      `;

  // await prisma.$queryRaw`
  //   SELECT
  //     emp.id AS employee_id,
  //     emp.employee_code,
  //     emp.full_name,
  //     att.date,
  //     att.check_in_time,
  //     att.check_out_time,
  //     att.check_in_status,
  //     att.check_out_status,
  //     att.day_status,
  //     att.work_hours,
  //     o1.NAME AS check_in_office,
  //     o2.NAME AS check_out_office
  //   FROM
  //     Employee emp
  //   LEFT JOIN Attendance att ON emp.id = att.employee_id AND att.date = CURRENT_DATE
  //   LEFT JOIN OfficeLocation o1 ON att.check_in_office_id = o1.id
  //   LEFT JOIN OfficeLocation o2 ON att.check_out_office_id = o2.id
  //   WHERE
  //     emp.is_deleted = FALSE
  // `;

  return attendance;
};

export const addAttendance = async (
  data: CreateAttendance,
  work_status: any,
  check_in_status: any
) => {
  let dataToInsert = {
    employee_id: data.employee_id,
    date: data.attendance_date,
  } as any;

  if (data.check_in_time) dataToInsert["check_in_time"] = data.check_in_time;
  if (data.check_out_time) dataToInsert["check_out_time"] = data.check_out_time;
  if (work_status)
    dataToInsert["work_hours"] = work_status.working_hours_formattted;
  if (work_status) dataToInsert["check_out_status"] = work_status.work_status;
  if (check_in_status) dataToInsert["check_in_status"] = check_in_status;

  const attendance = await prisma.attendance.create({
    data: dataToInsert,
  });
  return attendance;
};

export const attendanceById = async (attendance_id: number) => {
  const attendance = await prisma.attendance.findUnique({
    where: {
      id: attendance_id,
    },
  });
  return attendance;
};

export const updateAttendance = async (
  data: UpdateAttendance,
  work_status: any,
  check_in_status: any
) => {
  let dataToInsert = {
    date: data.attendance_date,
    day_status: "present",
  } as any;

  if (data.check_in_time) dataToInsert["check_in_time"] = data.check_in_time;
  if (data.check_out_time) dataToInsert["check_out_time"] = data.check_out_time;
  if (work_status)
    dataToInsert["work_hours"] = work_status.working_hours_formattted;
  if (work_status) dataToInsert["check_out_status"] = work_status.work_status;
  if (check_in_status) dataToInsert["check_in_status"] = check_in_status;

  const attendance = await prisma.attendance.update({
    where: { id: data.attendance_id },
    data: dataToInsert,
  });
  return attendance;
};

export const getAttendanceByDate = async (data: AttendanceByDate) => {
  const attendanceByDate = await prisma.$queryRaw`
        SELECT
          att.id,
	        emp.id AS employee_id,
	        emp.employee_code,
	        emp.full_name,
	        ${data.attendance_date} AS date,
	        att.check_in_time,
	        att.check_out_time,
	        att.check_in_status,
	        att.check_out_status,
          att.day_status,
	        att.work_hours,
	        o1.NAME AS check_in_office,
	        o2.NAME AS check_out_office 
        FROM
	        Employee emp
	      LEFT JOIN Attendance att ON emp.id = att.employee_id AND att.date = ${data.attendance_date}
	      LEFT JOIN OfficeLocation o1 ON att.check_in_office_id = o1.id
	      LEFT JOIN OfficeLocation o2 ON att.check_out_office_id = o2.id 
        WHERE
	        emp.is_deleted = FALSE
        ORDER BY COALESCE(att.check_in_time, '9999-12-31 23:59:58') ASC
      `;

  return attendanceByDate;
};

export const dailyAttendanceSummary = async () => {
  const result: any = await prisma.$queryRaw`
    SELECT
      COUNT(DISTINCT e.id) AS total_employees,
      SUM(CASE WHEN a.day_status = 'present' THEN 1 ELSE 0 END) AS present,
      SUM(CASE WHEN a.day_status = 'leave' THEN 1 ELSE 0 END) AS on_leave,
      SUM(CASE WHEN a.day_status = 'weekend' THEN 1 ELSE 0 END) AS weekend,
      SUM(CASE WHEN a.day_status = 'work_from_home' THEN 1 ELSE 0 END) AS work_from_home,
      SUM(CASE WHEN a.day_status IS NULL OR a.day_status = 'absent' THEN 1 ELSE 0 END) AS absent,
      SUM(CASE WHEN a.check_in_status = 'late' THEN 1 ELSE 0 END) AS late_arrivals,
      SUM(CASE WHEN a.check_in_status = 'manual' THEN 1 ELSE 0 END) AS manual_check_in,
      SUM(CASE WHEN a.check_out_status = 'early_leave' OR a.check_out_status = 'early_go' THEN 1 ELSE 0 END) AS early_leaves,
      SUM(CASE WHEN a.check_out_status = 'half_day' THEN 1 ELSE 0 END) AS half_days,
      SUM(CASE WHEN a.check_out_status = 'overtime' THEN 1 ELSE 0 END) AS overtimes,
      SUM(CASE WHEN a.check_out_status = 'manual' THEN 1 ELSE 0 END) AS manual_check_out
    FROM Employee e
    LEFT JOIN Attendance a
      ON e.id = a.employee_id AND a.date = CURDATE()
    WHERE e.status = 'active' AND e.is_active = 1 AND e.is_deleted = 0;
  `;

  const summary = result[0];

  const formatted = Object.fromEntries(
    Object.entries(summary).map(([key, value]) => [
      key,
      typeof value === "bigint" ? Number(value) : value,
    ])
  );

  return [formatted];
};

export const attendanceSummaryV2 = async (
  employee_id: number,
  start_date: string,
  end_date: string
) => {
  const query = `
    WITH RECURSIVE DateRange AS (
      SELECT '${start_date}' AS date
      UNION ALL
      SELECT DATE_ADD(date, INTERVAL 1 DAY)
      FROM DateRange
      WHERE date < '${end_date}'
    ),
    EmployeeDate AS (
      SELECT 
        e.id AS employee_id,
        e.full_name,
        d.name AS department_name,
        des.title AS designation_title,
        dr.date
    FROM Employee e
    JOIN Department d ON e.department_id = d.id
    JOIN Designation des ON e.designation_id = des.id
    CROSS JOIN DateRange dr
    WHERE e.is_active = 1 AND e.is_deleted = 0
    AND e.id = ${employee_id}
    )
    SELECT 
      ed.employee_id,
      ed.full_name AS employee_name,
      ed.department_name,
      ed.designation_title,
      CAST(COUNT(*) AS CHAR) AS total_days,
      SUM(CASE WHEN DAYOFWEEK(ed.date) NOT IN (1, 7) AND h.holiday_date IS NULL THEN 1 ELSE 0 END) AS working_days,
      SUM(CASE WHEN a.day_status = 'present' THEN 1 ELSE 0 END) AS present_days,
      SUM(CASE WHEN COALESCE(a.day_status, 'absent') = 'absent' THEN 1 ELSE 0 END) AS absent_days,
      SUM(CASE WHEN a.day_status = 'leave' THEN 1 ELSE 0 END) AS leave_days,
      SUM(CASE WHEN DAYOFWEEK(ed.date) IN (1, 7) THEN 1 ELSE 0 END) AS weekend_days,
      SUM(CASE WHEN a.day_status IN ('present', 'work_from_home') AND DAYOFWEEK(ed.date) IN (1, 7) THEN 1 ELSE 0 END) AS weekend_attendance_days,
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
      SUM(CASE 
        WHEN DAYOFWEEK(ed.date) NOT IN (1, 7) AND h.holiday_date IS NULL
        THEN 8 
        ELSE 0 
      END) AS expected_work_hours
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
      ed.employee_id
`;

  const attendanceSummary = await prisma.$queryRawUnsafe(query) as any[];
  // Format time safely in JS
  return attendanceSummary.map((row: any) => ({
    ...row,
    actual_work_hours: secondsToHHMMSS(row.actual_work_seconds),
  }));
};