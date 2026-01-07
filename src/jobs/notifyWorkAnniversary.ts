import prisma from "../config/db";
import {createNotification } from "../services/notificationServices";

interface WorkAnniversaryNotification {
  user_id: number;
  full_name: string;
  joining_date: Date;
  years_completed: number;
}

export async function notifyWorkAnniversary() {
  console.log("🎉 Work anniversary job started.");

  try {
    const records = await prisma.$queryRaw<WorkAnniversaryNotification[]>`
    SELECT 
        u.id AS user_id,
        e.full_name,
        e.join_date,
        TIMESTAMPDIFF(YEAR, e.join_date, CURDATE()) AS years_completed
      FROM Employee e
      JOIN User u ON u.employee_id = e.id
      WHERE 
        u.is_active = 1
        AND e.join_date IS NOT NULL
        AND e.department_id != '1'
        AND e.join_date != '1970-01-01'
        AND DAY(e.join_date) = DAY(CURDATE())
        AND MONTH(e.join_date) = MONTH(CURDATE())
        AND TIMESTAMPDIFF(YEAR, e.join_date, CURDATE()) > 0`;

    if (!records.length) {
      console.log("✅ No work anniversaries today.");
      return;
    }

    for (const emp of records) {
      const message = `Congratulations on completing ${emp.years_completed} year${
        emp.years_completed > 1 ? "s" : ""
      } with Orio Technologies!

Your dedication, professionalism, and contributions have been instrumental in driving our success. We sincerely appreciate your commitment and are proud to have you as part of our team.

Wishing you continued growth and many more achievements in the years ahead.`;

      await createNotification({
        user_id: [emp.user_id],
        title: `Celebrating Your Milestone – ${emp.years_completed} Year${
          emp.years_completed > 1 ? "s" : ""
        }`,
        message,
        type: "alert",
        priority: emp.years_completed >= 5 ? "high" : "medium",
      });
      console.log(`✅ Work anniversary notification sent to ${emp.full_name}`);
    }
  } catch (error) {
    console.error("❌ Work anniversary job failed:", error);
  }
}
