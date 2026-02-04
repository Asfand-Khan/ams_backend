import { DayStatus } from "@prisma/client";
import prisma from "../config/db";
import { createCombinedNotification } from "../services/notificationServices";

interface MeetingAttendeeNotification {
  user_ids: string;
  title: string;
  message: string;
}

export async function notifyUpcomingMeetings() {
  console.log("📢 Upcoming meeting reminders work started.");

  try {
    const nowPk = new Date(
      new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi" }),
    );
    const currentHour = nowPk.toTimeString().slice(0, 8);
    const nextHour = new Date(nowPk.getTime() + 60 * 60 * 1000)
      .toTimeString()
      .slice(0, 8);
    const meetings = await prisma.$queryRaw<MeetingAttendeeNotification[]>`
      SELECT 
        	CONCAT(
                  GROUP_CONCAT(DISTINCT u.id ORDER BY u.id),
                  ',',
                  m.host_id
                ) AS user_ids,
        CONCAT('Upcoming: ', UPPER(LEFT(m.recurrence_type,1)), LOWER(SUBSTRING(m.recurrence_type,2)), ' Meeting - ', m.title) AS title,
        CONCAT(
          'Your ', UPPER(LEFT(m.recurrence_type,1)), LOWER(SUBSTRING(m.recurrence_type,2)), ' meeting: ', m.title,
          ' is starting soon on ', DATE_FORMAT(mi.instance_date, '%d-%b-%Y'),
          ' at ', DATE_FORMAT(STR_TO_DATE(mi.start_time, '%H:%i:%s'), '%h:%i %p'), '. ',
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
        AND u.is_active = 1
      GROUP BY m.id, mi.instance_date, mi.start_time, m.recurrence_type, m.title, m.location_type, m.location_details, eh.full_name;
    `;

    if (!meetings.length) {
      console.log("✅ No upcoming meeting reminders to send.");
      return;
    }

    for (const meeting of meetings) {
      const userIds = meeting.user_ids.split(",").map(Number);

      await createCombinedNotification({
        user_id: userIds,
        title: meeting.title,
        message: meeting.message,
        type: "alert",
        priority: "high",
      });

      console.log(
        `✅ Upcoming meeting reminder sent for meeting "${
          meeting.title
        }" to users: ${userIds.join(", ")}`,
      );
    }

    console.log("📢 Upcoming meeting reminders work ended.");
  } catch (error) {
    console.error("❌ Upcoming meeting reminders failed:", error);
  }
}
