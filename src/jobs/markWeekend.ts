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
  const result = (await prisma.$queryRaw`
    SELECT
		  e.id,
      e.employee_code,
      e.full_name,
      e.email,
      s.name AS shift_name,
      s.start_time,
	    DATE_FORMAT(CURRENT_DATE, '%Y-%m-%d') AS adate
    FROM Employee e
    INNER JOIN EmployeeShift es ON e.id = es.employee_id
    INNER JOIN Shift s ON es.shift_id = s.id
    LEFT JOIN Attendance a ON e.id = a.employee_id AND a.date = CURRENT_DATE
    LEFT JOIN TeamMember tm ON e.id = tm.employee_id
    WHERE 
        a.id IS NULL
        AND (a.day_status IS NULL OR a.day_status NOT IN ('leave', 'absent', 'holiday'))
        AND e.id != 1
        AND DAYOFWEEK(CURRENT_DATE) = 1
        AND es.is_active = 1
        AND e.is_active = 1;
    `) as Employee[];

  if (!result.length) {
    console.log("✅ No weekend records to insert.");
    return;
  }

  const weekendRecords = result.map((emp) => ({
    employee_id: emp.id,
    date: emp.adate,
    day_status: "weekend" as DayStatus,
  }));

  await prisma.attendance.createMany({
    data: weekendRecords,
    skipDuplicates: true,
  });

  console.log(
    `✅ ${weekendRecords.length} weekend attendance records inserted`
  );
}
