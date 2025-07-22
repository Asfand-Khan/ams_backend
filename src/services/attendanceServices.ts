import prisma from "../config/db";
import {
  Attendance,
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

export const getEmployeeShift = async (employee_id: number) => {
  try {
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
  } catch (error: any) {
    throw new Error(`Failed to fetch employee shift: ${error.message}`);
  }
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
  try {
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
  } catch (error: any) {
    throw new Error(`Failed to mark check-in: ${error.message}`);
  }
};

export const getEmployeeAttendance = async (
  employee_id: number,
  date: string
) => {
  try {
    const employeeAttendance = await prisma.attendance.findFirst({
      where: {
        employee_id,
        date,
      },
    });
    return employeeAttendance;
  } catch (error: any) {
    throw new Error(`Failed to fetch employee attendance: ${error.message}`);
  }
};
export const getDayStatus = (
  checkInStatus: string | null,
  checkOutStatus: string | null,
  workingHours: number | null
) => {
  if (!checkInStatus || !checkOutStatus || !workingHours)
    throw new Error(
      "Check-in status, check-out status, and working hours are required."
    );

  const normalizedCheckOutStatus =
    checkOutStatus === "early_go" ? "early_leave" : checkOutStatus;

  if (checkInStatus === "absent") {
    return "absent";
  } else if (
    checkInStatus === "manual" ||
    normalizedCheckOutStatus === "manual"
  ) {
    return "manual_present";
  } else if (
    (checkInStatus === "on_time" || checkInStatus === "late") &&
    (normalizedCheckOutStatus === "on_time" ||
      normalizedCheckOutStatus === "overtime") &&
    workingHours >= 8
  ) {
    return "present";
  } else if (
    (checkInStatus === "on_time" || checkInStatus === "late") &&
    normalizedCheckOutStatus === "early_leave" &&
    workingHours <= 3.99
  ) {
    return "early_leave";
  } else if (
    checkInStatus === "on_time" &&
    normalizedCheckOutStatus === "early_leave" &&
    workingHours > 3.99 &&
    workingHours < 8
  ) {
    return "early_leave";
  } else if (
    checkInStatus === "late" &&
    normalizedCheckOutStatus === "early_leave" &&
    workingHours >= 4 &&
    workingHours < 8
  ) {
    return "half_day";
  } else if (normalizedCheckOutStatus === "half_day" && workingHours <= 5) {
    return "half_day";
  }
  return "present"; // Default case for unhandled scenarios
};

export const markCheckOut = async (data: {
  check_out_time: string;
  checkoutStatus: WorkStatus;
  check_out_office_location: number;
  workingHours: string;
  dayStatus: string;
  employee_id: number;
  attendance_date: string;
  attendance_id: number;
}) => {
  try {
    const attendance = await prisma.attendance.update({
      where: { id: data.attendance_id },
      data: {
        check_out_time: data.check_out_time,
        check_out_status: data.checkoutStatus,
        check_out_office_id: data.check_out_office_location,
        work_hours: data.workingHours,
        day_status: data.dayStatus as WorkStatus,
      },
    });
    return attendance;
  } catch (error: any) {
    throw new Error(`Failed to mark check-out: ${error.message}`);
  }
};

export const singleAttendance = async (employee_id: number, date: string) => {
  try {
    const attendance = await prisma.attendance.findFirst({
      where: {
        employee_id,
        date,
      },
    });
    return attendance;
  } catch (error: any) {
    throw new Error(`Failed to fetch single attendance: ${error.message}`);
  }
};

export const attendanceSummary = async (
  employee_id: number,
  start_date: string,
  end_date: string
) => {
  try {
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
  AND a.date BETWEEN '${start_date}' AND '${end_date}'
GROUP BY 
  a.employee_id;
`;

    const attendanceSummary = await prisma.$queryRawUnsafe(query);
    return attendanceSummary;
  } catch (error: any) {
    throw new Error(`Failed to fetch attendance: ${error.message}`);
  }
};

export const getAttendance = async (data: Attendance) => {
  try {
    let attendance = null;

    if (data.employee_id && data.start_date && data.end_date) {
      attendance = await prisma.$queryRaw`
        WITH RECURSIVE date_series AS (
        SELECT DATE(${data.start_date}) as date
        UNION ALL
        SELECT DATE_ADD(date, INTERVAL 1 DAY)
        FROM date_series
        WHERE date < ${data.end_date}
        )
      SELECT
        emp.id,
        emp.employee_code,
        emp.full_name,
        ds.date,
        att.check_in_time,
        att.check_out_time,
        att.work_hours
      FROM
        Employee emp
      CROSS JOIN date_series ds
      LEFT JOIN Attendance att ON emp.id = att.employee_id AND att.date = ds.date
      WHERE
        emp.id = ${data.employee_id}
      ORDER BY ds.date;
      `;
    } else {
      attendance = await prisma.$queryRaw`
        SELECT
	        emp.id,
	        emp.employee_code,
	        emp.full_name,
	        CURRENT_DATE as date,
	        att.check_in_time,
	        att.check_out_time,
	        att.work_hours 
        FROM
	        Employee emp
	      LEFT JOIN Attendance att ON emp.id = att.employee_id 
	      AND att.date = CURRENT_DATE 
        WHERE
	        emp.is_deleted = FALSE
      `;
    }

    return attendance;
  } catch (error: any) {
    throw new Error(`Failed to fetch attendance: ${error.message}`);
  }
};

export const addAttendance = async (
  data: CreateAttendance,
  work_status: any,
  check_in_status: any
) => {
  try {
    let dataToInsert = {
      employee_id: data.employee_id,
      date: data.attendance_date,
    } as any;

    if (data.check_in_time) dataToInsert["check_in_time"] = data.check_in_time;
    if (data.check_out_time) dataToInsert["check_out_time"] = data.check_out_time;
    if (work_status) dataToInsert["work_hours"] = work_status.working_hours_formattted;
    if (work_status) dataToInsert["check_out_status"] = work_status.work_status;
    if (check_in_status) dataToInsert["check_in_status"] = check_in_status;

    const attendance = await prisma.attendance.create({
      data: dataToInsert,
    });
    return attendance;
  } catch (error: any) {
    throw new Error(`Failed to add attendance: ${error.message}`);
  }
};

export const attendanceById = async (attendance_id: number) => {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: {
        id: attendance_id,
      },
    });
    return attendance;
  } catch (error: any) {
    throw new Error(`Failed to fetch attendance by id: ${error.message}`);
  }
};

export const updateAttendance = async (
  data: UpdateAttendance,
  work_status: any,
  check_in_status: any
) => {
  try {
    let dataToInsert = {
      date: data.attendance_date,
    } as any;

    if (data.check_in_time) dataToInsert["check_in_time"] = data.check_in_time;
    if (data.check_out_time) dataToInsert["check_out_time"] = data.check_out_time;
    if (work_status) dataToInsert["work_hours"] = work_status.working_hours_formattted;
    if (work_status) dataToInsert["check_out_status"] = work_status.work_status;
    if (check_in_status) dataToInsert["check_in_status"] = check_in_status;

    const attendance = await prisma.attendance.update({
      where: { id: data.attendance_id },
      data: dataToInsert,
    });
    return attendance;
  } catch (error: any) {
    throw new Error(`Failed to update attendance: ${error.message}`);
  }
};
