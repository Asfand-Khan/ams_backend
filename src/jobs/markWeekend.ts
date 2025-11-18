import { DayStatus } from "@prisma/client";
import prisma from "../config/db";

interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  email: string;
  shift_name: string;
  start_time: string;
  adate: string;
}

// export async function markWeekend() {
//   const today = new Date();
//   const dayOfWeek = today.getDay(); // Sunday = 0 to Saturday = 6

//   let weekendCondition = "";
//   if (dayOfWeek === 6) {
//     weekendCondition = "AND DAYOFWEEK(CURRENT_DATE) = 7";  // Saturday
//   } else if (dayOfWeek === 0) {
//     weekendCondition = "AND DAYOFWEEK(CURRENT_DATE) = 1";  // Sunday
//   } else {
//     console.log("✅ Today is neither Saturday nor Sunday. Job completed.");
//     return;
//   }

//   const result = (await prisma.$queryRawUnsafe(`
//     SELECT
//       e.id,
//       e.employee_code,
//       e.full_name,
//       e.email,
//       s.name AS shift_name,
//       s.start_time,
//       DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d') AS adate
//     FROM Employee e
//     INNER JOIN EmployeeShift es ON e.id = es.employee_id
//     INNER JOIN Shift s ON es.shift_id = s.id
//     LEFT JOIN Attendance a
//       ON e.id = a.employee_id AND a.date = CURRENT_DATE
//     LEFT JOIN TeamMember tm
//       ON e.id = tm.employee_id
//     WHERE
//       a.id IS NULL
//       AND (a.day_status IS NULL OR a.day_status NOT IN ('leave', 'absent', 'holiday'))
//       AND e.id != 1
//       ${weekendCondition}
//       AND es.is_active = 1
//       AND e.is_active = 1
//       AND tm.team_id NOT IN (4, 5);
//   `)) as Employee[];

//   if (!result.length) {
//     console.log("✅ No weekend records to insert.");
//     return;
//   }

//   const weekendRecords = result.map((emp) => ({
//     employee_id: emp.id,
//     date: emp.adate,
//     day_status: "weekend" as DayStatus,
//   }));

//   await prisma.attendance.createMany({
//     data: weekendRecords,
//     skipDuplicates: true,
//   });

//   console.log(
//     `✅ ${weekendRecords.length} weekend attendance records inserted`
//   );
// }

export async function markWeekend() {
  // 1) Resolve "today" in Asia/Karachi to align app logic and the cron schedule
  const nowPk = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
  const jsDay = nowPk.getDay(); // Sunday = 0 ... Saturday = 6

  // 2) If weekday, exit gracefully
  if (jsDay !== 0 && jsDay !== 6) {
    console.log("✅ Weekday detected in Asia/Karachi. Weekend marker skipped.");
    return;
  }

  // Map JS day → MySQL DAYOFWEEK value: Sunday=1, Saturday=7
  const mysqlDay = jsDay === 0 ? 1 : 7;

  // 3) Pull only employees who need a weekend row today
  //    - Active employee + active shift
  //    - No attendance row today yet
  //    - Exclude team_id IN (4,5) using NOT EXISTS
  //    - Keep DB-side day check as an extra guard
  const result = await prisma.$queryRaw<Employee[]>`
    SELECT
      e.id,
      e.employee_code,
      e.full_name,
      e.email,
      s.name AS shift_name,
      s.start_time,
      DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS adate
    FROM Employee e
    INNER JOIN EmployeeShift es
      ON e.id = es.employee_id AND es.is_active = 1
    INNER JOIN Shift s
      ON es.shift_id = s.id
    WHERE
      e.is_active = 1
      AND e.id <> 1
      AND DAYOFWEEK(CURDATE()) = ${mysqlDay}
      AND NOT EXISTS (
        SELECT 1
        FROM Attendance a
        WHERE a.employee_id = e.id
          AND a.date = CURDATE()
      )
      AND NOT EXISTS (
        SELECT 1
        FROM TeamMember tm
        WHERE tm.employee_id = e.id
          AND (
            (tm.team_id IN (4,5) AND ${jsDay} = 7) 
            OR tm.team_id NOT IN (4,5)
          )
      )
  `;

  if (!result.length) {
    console.log("✅ No weekend records to insert.");
    return;
  }

  // 4) Build rows for bulk insert
  const weekendRecords = result.map((emp) => ({
    employee_id: emp.id,
    date: emp.adate, // 'YYYY-MM-DD' string aligns with DATE column
    day_status: "weekend" as DayStatus,
  }));

  // 5) Insert and report the real count
  const insertRes = await prisma.attendance.createMany({
    data: weekendRecords,
    skipDuplicates: true, // requires a unique index on (employee_id, date)
  });

  console.log(`✅ ${insertRes.count} weekend attendance records inserted.`);
}
