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

export async function markWeekend() {
  const nowPk = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
  );
  const jsDay = nowPk.getDay();
  if (jsDay !== 0 && jsDay !== 6) {
    console.log("✅ Weekday detected in Asia/Karachi. Weekend marker skipped.");
    return;
  }
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
    LEFT JOIN Attendance a
        ON e.id = a.employee_id AND a.date = CURDATE()
    LEFT JOIN TeamMember tm
        ON e.id = tm.employee_id
    WHERE
      e.is_active = 1
      AND e.department_id != 1
      AND a.id IS NULL
      AND (
        (${jsDay} = 6 AND (tm.team_id IS NULL OR tm.team_id NOT IN (4,5)))
        OR
        (${jsDay} = 0) 
      )
  `;
  if (!result.length) {
    console.log("✅ No weekend records to insert.");
    return;
  }

  const weekendRecords = result.map((emp) => ({
    employee_id: emp.id,
    date: emp.adate,
    day_status: "weekend" as DayStatus,
  }));

  const insertRes = await prisma.attendance.createMany({
    data: weekendRecords,
    skipDuplicates: true,
  });

  console.log(`✅ ${insertRes.count} weekend attendance records inserted.`);
}
