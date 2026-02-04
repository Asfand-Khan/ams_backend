import { DayStatus } from "@prisma/client";
import prisma from "../config/db";
import { createCombinedNotification } from "../services/notificationServices";

interface MeetingAttendeeNotification {
  user_ids: string;
  title: string;
  message: string;
}

export async function notifyMeetingReminders() {
  console.log("📢 Nightly meeting reminders work started.");

  try {
    const meetings = await prisma.$queryRaw<MeetingAttendeeNotification[]>`
      SELECT 
        	CONCAT(
                  GROUP_CONCAT(DISTINCT u.id ORDER BY u.id),
                  ',',
                  m.host_id
                ) AS user_ids,
        CONCAT('Reminder: ', UPPER(LEFT(m.recurrence_type, 1)), LOWER(SUBSTRING(m.recurrence_type, 2)), ' Meeting Tomorrow - ', m.title) AS title,
           CONCAT(
          'Reminder: You have a ', UPPER(LEFT(m.recurrence_type, 1)), LOWER(SUBSTRING(m.recurrence_type, 2)), ' meeting tomorrow: ', m.title,
          ' on ', DATE_FORMAT(mi.instance_date, '%d-%b-%Y'),
        ' from ', DATE_FORMAT(STR_TO_DATE(mi.start_time, '%H:%i:%s'), '%h:%i %p'),
              ' to ', DATE_FORMAT(STR_TO_DATE(mi.end_time, '%H:%i:%s'), '%h:%i %p'), '. ',
          'Location: ', m.location_type, ' - ', m.location_details, '. ',
          'Host: ', eh.full_name, '. Please ensure you are prepared.'
        )AS message
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
        AND u.is_active = 1
      GROUP BY m.id, title, message;
    `;

    if (!meetings.length) {
      console.log("✅ No meeting reminders to send.");
      return;
    }
    for (const meeting of meetings) {
      const userIds = meeting.user_ids.split(",").map(Number);

      await createCombinedNotification({
        user_id: userIds,
        title: meeting.title,
        message: meeting.message,
        type: "alert",
        priority: "medium",
      });

      console.log(
        `✅ Combined notification sent for meeting "${
          meeting.title
        }" to users: ${userIds.join(", ")}`
      );
    }

    console.log("📢 Nightly meeting reminders work ended.");
  } catch (error) {
    console.error("❌ Nightly meeting reminders failed:", error);
  }
}
