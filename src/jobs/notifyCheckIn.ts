import prisma from "../config/db";
import { sendPushNotification } from "../utils/sendPushNotification";

interface Employee {
  employee_code: string;
  full_name: string;
  email: string;
  shift_name: string;
  start_time: string;
  token: string;
}

export async function notifyCheckIN09AM() {
  const result = (await prisma.$queryRaw`
    SELECT 
      e.employee_code,
      e.full_name,
      e.email,
      s.name AS shift_name,
      s.start_time,
      fcm.token AS token
    FROM Employee e
    INNER JOIN EmployeeShift es ON e.id = es.employee_id
    INNER JOIN Shift s ON es.shift_id = s.id
    LEFT JOIN User u ON e.id = u.employee_id
    LEFT JOIN FCMToken fcm ON u.id = fcm.user_id
    LEFT JOIN Attendance a ON e.id = a.employee_id AND a.date = CURRENT_DATE
    LEFT JOIN TeamMember tm ON e.id = tm.employee_id
    WHERE 
      a.check_in_time IS NULL
      AND (a.day_status IS NULL OR a.day_status NOT IN ('leave', 'absent', 'holiday'))
      AND s.id = 1
      AND DAYOFWEEK(CURRENT_DATE) != 1
      AND (
        DAYOFWEEK(CURRENT_DATE) = 7 AND tm.team_id IN (4, 5)
        OR DAYOFWEEK(CURRENT_DATE) != 7
      )
      AND es.is_active = 1
      AND e.is_active = 1
      AND fcm.is_active = 1
      AND fcm.token IS NOT NULL;
    `) as Employee[];

  const tokenList = result.map((t) => t.token);
  await sendPushNotification(
    tokenList,
    "Check In Time Alert!",
    "Kindly Mark your today's check in time."
  );
}

export async function notifyCheckIN10AM() {
  const result = (await prisma.$queryRaw`
    SELECT 
      e.employee_code,
      e.full_name,
      e.email,
      s.name AS shift_name,
      s.start_time,
      fcm.token AS token
    FROM Employee e
    INNER JOIN EmployeeShift es ON e.id = es.employee_id
    INNER JOIN Shift s ON es.shift_id = s.id
    LEFT JOIN User u ON e.id = u.employee_id
    LEFT JOIN FCMToken fcm ON u.id = fcm.user_id
    LEFT JOIN Attendance a ON e.id = a.employee_id AND a.date = CURRENT_DATE
    LEFT JOIN TeamMember tm ON e.id = tm.employee_id
    WHERE 
      a.check_in_time IS NULL
      AND (a.day_status IS NULL OR a.day_status NOT IN ('leave', 'absent', 'holiday'))
      AND s.id = 2
      AND DAYOFWEEK(CURRENT_DATE) != 1
      AND (
        DAYOFWEEK(CURRENT_DATE) = 7 AND tm.team_id IN (4, 5)
        OR DAYOFWEEK(CURRENT_DATE) != 7
      )
      AND es.is_active = 1
      AND e.is_active = 1
      AND fcm.is_active = 1
      AND fcm.token IS NOT NULL;
    `) as Employee[];

  const tokenList = result.map((t) => t.token);
  await sendPushNotification(
    tokenList,
    "Check In Time Alert!",
    "Kindly Mark your today's check in time."
  );
}

export async function notifyCheckIN11AM() {
  const result = (await prisma.$queryRaw`
    SELECT 
      e.employee_code,
      e.full_name,
      e.email,
      s.name AS shift_name,
      s.start_time,
      fcm.token AS token
    FROM Employee e
    INNER JOIN EmployeeShift es ON e.id = es.employee_id
    INNER JOIN Shift s ON es.shift_id = s.id
    LEFT JOIN User u ON e.id = u.employee_id
    LEFT JOIN FCMToken fcm ON u.id = fcm.user_id
    LEFT JOIN Attendance a ON e.id = a.employee_id AND a.date = CURRENT_DATE
    LEFT JOIN TeamMember tm ON e.id = tm.employee_id
    WHERE 
      a.check_in_time IS NULL
      AND (a.day_status IS NULL OR a.day_status NOT IN ('leave', 'absent', 'holiday'))
      AND s.id = 3
      AND DAYOFWEEK(CURRENT_DATE) != 1
      AND (
        DAYOFWEEK(CURRENT_DATE) = 7 AND tm.team_id IN (4, 5)
        OR DAYOFWEEK(CURRENT_DATE) != 7
      )
      AND es.is_active = 1
      AND e.is_active = 1
      AND fcm.is_active = 1
      AND fcm.token IS NOT NULL;
    `) as Employee[];

  const tokenList = result.map((t) => t.token);
  await sendPushNotification(
    tokenList,
    "Check In Time Alert!",
    "Kindly Mark your today's check in time."
  );
}