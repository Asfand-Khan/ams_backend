import { DayStatus } from "@prisma/client";
import prisma from "../config/db";
import { createNotification } from "../services/notificationServices";
interface MeetingAttendeeNotification {
  user_id: number;
  title: string;
  message: string;
}
// 
export async function notifyUpcomingMeetings() {
  console.log("📢 Upcoming meeting reminders work started.");
  try {
    const nowPk = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" })
    );
    const currentHour = nowPk.toTimeString().slice(0, 8); 
    const nextHour = new Date(nowPk.getTime() + 60 * 60 * 1000)
      .toTimeString()
      .slice(0, 8); 
    const attendees = await prisma.$queryRaw<MeetingAttendeeNotification[]>`
      SELECT DISTINCT
        u.id AS user_id,
        CONCAT('Upcoming: ', UPPER(LEFT(m.recurrence_type, 1)), LOWER(SUBSTRING(m.recurrence_type, 2)), ' Meeting - ', m.title) AS title,
        CONCAT(
          'Your ', UPPER(LEFT(m.recurrence_type, 1)), LOWER(SUBSTRING(m.recurrence_type, 2)), ' meeting: ', m.title, ' is starting soon on ', mi.instance_date, ' at ', mi.start_time, '. ',
          'Location: ', m.location_type, ' - ', m.location_details, '. ',
          'Host: ', eh.full_name, '. Please be prepared.'
        ) AS message
      FROM MeetingAttendee ma
      JOIN Meeting m ON ma.meeting_id = m.id
      JOIN MeetingInstance mi ON mi.meeting_id = m.id
      JOIN Employee e ON ma.employee_id = e.id
      JOIN User u ON u.employee_id = e.id
      JOIN Employee eh ON m.host_id = eh.id
      WHERE mi.instance_date = CURDATE()
        AND mi.start_time >= ${currentHour}
        AND mi.start_time < ${nextHour}
        AND mi.status = 'scheduled'
        AND ma.is_active = 1
        AND u.is_active = 1;
    `;

    if (!attendees.length) {
      console.log("✅ No upcoming meeting reminders to send.");
      return;
    }

    const results = await Promise.allSettled(
      attendees.map(attendee =>
        createNotification({
          user_id: attendee.user_id,
          title: attendee.title,
          message: attendee.message,
          type: "alert",
          priority: "high",
        })
      )
    );
    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        console.log(`✅ Upcoming meeting reminder sent for user_id: ${attendees[idx].user_id}`);
      } else {
        console.error(`❌ Failed to send upcoming meeting reminder for user_id: ${attendees[idx].user_id}`, result.reason);
      }
    });

    console.log("📢 Upcoming meeting reminders work ended.");
  } catch (error) {
    console.error("❌ Upcoming meeting reminders failed:", error);
  }
}