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
	          d.date;
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
      `;

  return attendanceByDate;
};

// export const getDayStatus = (
//   checkInStatus: string | null,
//   checkOutStatus: string | null,
//   workingHours: number | null
// ) => {
//   if (!checkInStatus || !checkOutStatus || !workingHours)
//     throw new Error(
//       "Check-in status, check-out status, and working hours are required."
//     );

//   const normalizedCheckOutStatus =
//     checkOutStatus === "early_go" ? "early_leave" : checkOutStatus;

//   if (checkInStatus === "absent") {
//     return "absent";
//   } else if (
//     checkInStatus === "manual" ||
//     normalizedCheckOutStatus === "manual"
//   ) {
//     return "manual_present";
//   } else if (
//     (checkInStatus === "on_time" || checkInStatus === "late") &&
//     (normalizedCheckOutStatus === "on_time" ||
//       normalizedCheckOutStatus === "overtime") &&
//     workingHours >= 8
//   ) {
//     return "present";
//   } else if (
//     (checkInStatus === "on_time" || checkInStatus === "late") &&
//     normalizedCheckOutStatus === "early_leave" &&
//     workingHours <= 3.99
//   ) {
//     return "early_leave";
//   } else if (
//     checkInStatus === "on_time" &&
//     normalizedCheckOutStatus === "early_leave" &&
//     workingHours > 3.99 &&
//     workingHours < 8
//   ) {
//     return "early_leave";
//   } else if (
//     checkInStatus === "late" &&
//     normalizedCheckOutStatus === "early_leave" &&
//     workingHours >= 4 &&
//     workingHours < 8
//   ) {
//     return "half_day";
//   } else if (normalizedCheckOutStatus === "half_day" && workingHours <= 5) {
//     return "half_day";
//   }
//   return "present"; // Default case for unhandled scenarios
// };
