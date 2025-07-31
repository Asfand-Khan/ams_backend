import prisma from "../config/db";
import { sendPushNotification } from "../utils/sendPushNotification";

interface Employee {
  employee_code: string;
  full_name: string;
  email: string;
  shift_name: string;
  end_time: string;
  token: string;
}

export default async function notifyCheckOUT6PM() {
  const result = (await prisma.$queryRaw`
        SELECT 
            e.employee_code,
            e.full_name,
            e.email,
            s.name AS shift_name,
            s.end_time,
            fcm.token AS token
        FROM Employee e
        INNER JOIN EmployeeShift es ON e.id = es.employee_id
        INNER JOIN Shift s ON es.shift_id = s.id
        LEFT JOIN User u ON e.id = u.employee_id
        LEFT JOIN FCMToken fcm ON u.id = fcm.user_id
        LEFT JOIN Attendance a ON e.id = a.employee_id AND a.date = CURRENT_DATE
        WHERE 
            a.check_out_time IS NULL
        AND s.id = 2
        HAVING 
            token IS NOT NULL;
    `) as Employee[];

  const tokenList = result.map((t) => t.token);
  await sendPushNotification(
    tokenList,
    "Check Out Time Alert!",
    "Kindly Mark your today's check out time."
  );
}
