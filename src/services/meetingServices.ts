import { INSPECT_MAX_BYTES } from "buffer";
import prisma from "../config/db";
import { generateMeetingInstances } from "../utils/dateOrTimeBasedUtilities";
import {
  AttendMeeting,
  Meeting,
  MeetingInstanceList,
  MeetingInstanceStatus,
  MeetingList,
  MeetingMinute,
} from "../validations/meetingValidations";

export const dashboardMeetingList = async () => {
  const meetings = await prisma.meeting.findMany({
    include: {
      meeting_host: {
        select: {
          full_name: true,
        },
      },
    },
  });
  return meetings;
};

export const meetingInstanceListById = async (data: MeetingInstanceList) => {
  const instances = await prisma.$queryRaw`
        SELECT
	        mi.id AS meeting_instance_id,
	        mi.meeting_id,
	        mi.instance_date,
	        mi.start_time,
	        mi.end_time,
	        mi.status,
	        m.title,
	        m.recurrence_rule,
	        m.recurrence_type,
	        m.recurrence_start_date,
	        m.recurrence_end_date,
	        m.location_type,
	        m.location_details,
	        m.agenda,
	        h.full_name AS host_name,
	        GROUP_CONCAT( DISTINCT e.full_name ) AS attendees,
          mi.is_active
        FROM
	        MeetingInstance mi
	      LEFT JOIN Meeting m ON m.id = mi.meeting_id
	      LEFT JOIN Employee h ON h.id = m.host_id
	      LEFT JOIN MeetingAttendee ma ON ma.meeting_instance_id = mi.id
	      LEFT JOIN Employee e ON e.id = ma.employee_id 
        WHERE
	        m.id = ${data.meeting_id}
	        AND mi.is_deleted = 0 
	        AND m.is_active = 1 
	        AND m.is_deleted = 0 
          AND mi.instance_date BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
          AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
        GROUP BY
	        mi.id;
        `;
  return instances;
};

export const createMeeting = async (data: Meeting) => {
  const meeting = await prisma.$transaction(async (tx) => {
    const newMeeting = await prisma.meeting.create({
      data: {
        title: data.title,
        recurrence_rule: data.recurrence_rule,
        recurrence_type: data.recurrence_type,
        start_time: data.start_time,
        end_time: data.end_time,
        recurrence_start_date: data.recurrence_start_date,
        recurrence_end_date: data.recurrence_end_date,
        host_id: data.host_id,
        location_type: data.location_type,
        location_details: data.location_details,
        agenda: data.agenda,
      },
    });

    const instances = generateMeetingInstances(
      data.recurrence_rule,
      data.recurrence_type,
      data.recurrence_start_date,
      data.recurrence_end_date,
      data.start_time,
      data.end_time
    );

    await tx.meetingInstance.createMany({
      data: instances.map((inst) => ({
        meeting_id: newMeeting.id,
        instance_date: inst.instance_date,
        start_time: inst.start_time,
        end_time: inst.end_time,
      })),
    });

    const createdInstances = await tx.meetingInstance.findMany({
      where: { meeting_id: newMeeting.id },
      select: { id: true },
    });

    if (data.attendees && data.attendees.length > 0) {
      const attendeesData = createdInstances.flatMap((inst) =>
        data.attendees.map((attId) => ({
          meeting_id: newMeeting.id,
          meeting_instance_id: inst.id,
          employee_id: attId,
        }))
      );

      await tx.meetingAttendee.createMany({
        data: attendeesData,
      });
    }

    return newMeeting;
  });

  return meeting;
};

export const attendMeeting = async (data: AttendMeeting) => {
  const meeting = await prisma.meetingAttendee.findFirst({
    where: {
      meeting_instance_id: data.meeting_instance_id,
      employee_id: data.employee_id,
      meeting_id: data.meeting_id,
    },
  });

  if (!meeting) throw new Error("Meeting not found.");

  const updatedMeeting = await prisma.meetingAttendee.update({
    where: {
      id: meeting.id,
    },
    data: {
      attended: true,
    },
  });

  return updatedMeeting;
};

export const meetingMinute = async (data: MeetingMinute) => {
  const meeting = await prisma.meetingInstance.findUnique({
    where: {
      id: data.meeting_instance_id,
    },
  });

  if (!meeting) throw new Error("Meeting instance not found.");

  const newMinutes = await prisma.meetingMinutes.create({
    data: {
      meeting_instance_id: data.meeting_instance_id,
      minutes: data.minutes,
      meeting_id: data.meeting_id,
      created_by: 1,
    },
  });

  return newMinutes;
};

export const meetingList = async (data: MeetingList) => {
  let result;

  if (data.employee_id && data.end_date) {
    result = await prisma.$queryRaw`
        SELECT
            mi.id AS meeting_instance_id,
            mi.meeting_id,
            mi.instance_date,
            mi.start_time,
            mi.end_time,
            mi.status,
            m.title,
            m.recurrence_rule,
            m.recurrence_type,
            m.recurrence_start_date,
            m.recurrence_end_date,
            m.location_type,
            m.location_details,
            m.agenda,
            h.full_name AS host_name,
            GROUP_CONCAT(DISTINCT e.full_name) AS attendees
        FROM MeetingInstance mi
            LEFT JOIN Meeting m ON m.id = mi.meeting_id
            LEFT JOIN Employee h ON h.id = m.host_id
            LEFT JOIN MeetingAttendee ma ON ma.meeting_instance_id = mi.id
            LEFT JOIN Employee e ON e.id = ma.employee_id
        WHERE
            mi.is_active = 1
            AND mi.is_deleted = 0
            AND m.is_active = 1
            AND m.is_deleted = 0
            AND mi.instance_date <= ${data.end_date}
            AND EXISTS (                 
                SELECT 1
                    FROM MeetingAttendee ma2
                WHERE ma2.meeting_instance_id = mi.id
                    AND ma2.employee_id = ${data.employee_id}
                )
        GROUP BY mi.id;
    `;
  } else {
    result = await prisma.$queryRaw`
        SELECT
	        mi.id AS meeting_instance_id,
	        mi.meeting_id,
    	    mi.instance_date,
	        mi.start_time,
	        mi.end_time,
	        mi.status,
	        m.title,
	        m.recurrence_rule,
	        m.recurrence_type,
	        m.recurrence_start_date,
	        m.recurrence_end_date,
	        m.location_type,
	        m.location_details,
	        m.agenda,
	        h.full_name,
	        GROUP_CONCAT( e.full_name ) AS attendees 
        FROM
	        MeetingInstance mi
	        LEFT JOIN Meeting m ON m.id = mi.meeting_id
	        LEFT JOIN Employee h ON h.id = m.host_id
	        LEFT JOIN MeetingAttendee ma ON ma.meeting_instance_id = mi.id
	        LEFT JOIN Employee e ON e.id = ma.employee_id 
        WHERE
	        mi.is_active = 1 
	        AND mi.is_deleted = 0 
	        AND m.is_active = 1 
	        AND m.is_deleted = 0 
        GROUP BY
	        mi.id
        `;
  }

  return result;
};

export const toggleMeetingInstanceStatus = async (
  data: MeetingInstanceStatus
) => {
  const instance = await prisma.meetingInstance.findUnique({
    where: { id: data.meeting_instance_id },
    select: { is_active: true },
  });

  if (!instance) {
    throw new Error("Meeting instance not found");
  }

  return prisma.meetingInstance.update({
    where: { id: data.meeting_instance_id },
    data: {
      is_active: !instance.is_active,
    },
  });
};
