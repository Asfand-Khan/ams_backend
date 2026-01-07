import prisma from "../config/db";
import {createNotification } from "../services/notificationServices";

interface BirthdayNotification {
  user_id: number;
  full_name: string;
}

export async function notifyBirthday() {
  console.log("🎂 Birthday notification job started.");

  try {
    const birthdays = await prisma.$queryRaw<BirthdayNotification[]>`
      SELECT 
        u.id AS user_id,
        e.full_name
      FROM Employee e
      JOIN User u ON u.employee_id = e.id
      WHERE
        u.is_active = 1
        AND e.department_id != '1'
        AND e.dob IS NOT NULL
        AND e.dob != '1970-01-01'
        AND DAY(e.dob) = DAY(CURDATE())
        AND MONTH(e.dob) = MONTH(CURDATE());
    `;

    if (!birthdays.length) {
      console.log("✅ No birthdays today.");
      return;
    }

    for (const emp of birthdays) {
     const message = `On behalf of the entire Orio Technologies team, we wish you a very Happy Birthday!

May this year bring you continued professional success, excellent health, and countless moments of joy and personal achievement.

Thank you for your valuable contributions to the team. We look forward to your continued growth and success with us.`;

      await createNotification({
        user_id: [emp.user_id],
        title: `Happy Birthday, ${emp.full_name}!`,
        message,
        type: "alert",
        priority: "medium",
      });

      console.log(`✅ Birthday wish sent to ${emp.full_name}`);
    }
  } catch (error) {
    console.error("❌ Birthday notification failed:", error);
  }
}
