import { DayStatus } from "@prisma/client";
import prisma from "../config/db";
import { createNotification } from "../services/notificationServices";

interface MeetingAttendeeNotification {
  user_id: number;
  title: string;
  message: string;
}

export async function notifyMeetingReminders() {
  console.log("📢 Nightly meeting reminders work started.");

  try {
    const attendees = (await prisma.$queryRaw<MeetingAttendeeNotification[]>`
      SELECT DISTINCT
        u.id AS user_id,
        CONCAT('Reminder: ', UPPER(LEFT(m.recurrence_type, 1)), LOWER(SUBSTRING(m.recurrence_type, 2)), ' Meeting Tomorrow - ', m.title) AS title,
        CONCAT(
          'Reminder: You have a ', UPPER(LEFT(m.recurrence_type, 1)), LOWER(SUBSTRING(m.recurrence_type, 2)), ' meeting tomorrow: ', m.title,
          ' on ', mi.instance_date, ' from ', mi.start_time, ' to ', mi.end_time, '. ',
          'Location: ', m.location_type, ' - ', m.location_details, '. ',
          'Host: ', eh.full_name, '. Please ensure you are prepared.'
        ) AS message
      FROM MeetingAttendee ma
      JOIN Meeting m ON ma.meeting_id = m.id
      JOIN MeetingInstance mi ON mi.meeting_id = m.id
      JOIN Employee e ON ma.employee_id = e.id
      JOIN User u ON u.employee_id = e.id
      JOIN Employee eh ON m.host_id = eh.id
      WHERE
        mi.instance_date = DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        AND mi.status = 'scheduled'
        AND ma.is_active = 1
        AND u.is_active = 1;
    `);

    if (!attendees.length) {
      console.log("✅ No meeting reminders to send.");
      return;
    }

    const results = await Promise.allSettled(
      attendees.map(attendee =>
        createNotification({
          user_id: attendee.user_id,
          title: attendee.title,
          message: attendee.message,
          type: "alert",
          priority: "medium",
        })
      )
    );

    results.forEach((result, idx) => {
      if (result.status === "fulfilled") {
        console.log(`✅ Notification sent for user_id: ${attendees[idx].user_id}`);
      } else {
        console.error(`❌ Failed to send notification for user_id: ${attendees[idx].user_id}`, result.reason);
      }
    });

    console.log("📢 Nightly meeting reminders work ended.");
  } catch (error) {
    console.error("❌ Nightly meeting reminders failed:", error);
  }
}

