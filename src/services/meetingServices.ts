import { INSPECT_MAX_BYTES } from "buffer";
import prisma from "../config/db";
import { generateMeetingInstances } from "../utils/dateOrTimeBasedUtilities";
import { getMeetingTemplate } from "../utils/meetingTemplate";
import { sendEmail } from "../utils/sendEmail";
import {
  AttendMeeting,
  Meeting,
  MeetingInstanceList,
  MeetingInstanceStatus,
  MeetingList,
  MeetingMinute,
} from "../validations/meetingValidations";

export const dashboardMeetingList = async (user: any) => {
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }

  const userType = userRecord.type;

  // For admin and hr, fetch all meetings
  if (userType === "admin" || userType === "hr") {
    const meetings = await prisma.meeting.findMany({
      where: {
        is_active: true,
        is_deleted: false,
      },
      include: {
        meeting_host: {
          select: {
            full_name: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Convert BigInt to number for JSON serialization to match expected format
    return meetings.map((meeting) => ({
      id: Number(meeting.id),
      title: meeting.title,
      recurrence_rule: meeting.recurrence_rule,
      recurrence_type: meeting.recurrence_type,
      start_time: meeting.start_time,
      end_time: meeting.end_time,
      recurrence_start_date: meeting.recurrence_start_date,
      recurrence_end_date: meeting.recurrence_end_date,
      host_id: Number(meeting.host_id),
      location_type: meeting.location_type,
      location_details: meeting.location_details,
      agenda: meeting.agenda,
      status: meeting.status,
      is_active: meeting.is_active,
      is_deleted: meeting.is_deleted,
      created_at: meeting.created_at.toISOString(),
      updated_at: meeting.updated_at.toISOString(),
      meeting_host: meeting.meeting_host,
    }));
  }

  // For other user types (lead, employee, etc.)
  // Base employee IDs to filter meetings (user themselves)
  let employeeIds: number[] = [user.id];

  // For lead users, include team members
  if (userType === "lead") {
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: {
          team_lead_id: user.id,
        },
        is_active: true,
        is_deleted: false,
      },
      select: {
        employee_id: true,
      },
    });

    const teamMemberIds = teamMembers.map((member) => member.employee_id);
    employeeIds = [...employeeIds, ...teamMemberIds];
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [
        { host_id: user.id }, // User is the host
        {
          attendees: {
            some: {
              employee_id: {
                in: employeeIds, // User or team members are attendees
              },
              is_active: true,
              is_deleted: false,
            },
          },
        },
      ],
      is_active: true,
      is_deleted: false,
    },
    include: {
      meeting_host: {
        select: {
          full_name: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  // Convert BigInt to number for JSON serialization to match expected format
  return meetings.map((meeting) => ({
    id: Number(meeting.id),
    title: meeting.title,
    recurrence_rule: meeting.recurrence_rule,
    recurrence_type: meeting.recurrence_type,
    start_time: meeting.start_time,
    end_time: meeting.end_time,
    recurrence_start_date: meeting.recurrence_start_date,
    recurrence_end_date: meeting.recurrence_end_date,
    host_id: Number(meeting.host_id),
    location_type: meeting.location_type,
    location_details: meeting.location_details,
    agenda: meeting.agenda,
    status: meeting.status,
    is_active: meeting.is_active,
    is_deleted: meeting.is_deleted,
    created_at: meeting.created_at.toISOString(),
    updated_at: meeting.updated_at.toISOString(),
    meeting_host: meeting.meeting_host,
  }));
};

export const meetingInstanceListById = async (data: MeetingInstanceList) => {
  const instances = await prisma.$queryRaw`
        SELECT
	        mi.id AS meeting_instance_id,
	        mi.meeting_id,
	        DATE_FORMAT(mi.instance_date, '%d-%b-%Y') AS instance_date,
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
          mi.is_active,
          MAX(mm.minutes) AS minutes
        FROM
	        MeetingInstance mi
	      LEFT JOIN Meeting m ON m.id = mi.meeting_id
	      LEFT JOIN Employee h ON h.id = m.host_id
	      LEFT JOIN MeetingAttendee ma ON ma.meeting_instance_id = mi.id
	      LEFT JOIN Employee e ON e.id = ma.employee_id
        LEFT JOIN MeetingMinutes mm ON mm.meeting_instance_id = mi.id
        WHERE
	        m.id = ${data.meeting_id}
	        AND mi.is_deleted = 0 
	        AND m.is_active = 1 
	        AND m.is_deleted = 0 
          AND (mi.instance_date <= CURDATE() 
					OR mi.instance_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY))
        GROUP BY
                mi.id
        ORDER BY 
                mi.instance_date desc;
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
    const meetingDetails = (await tx.$queryRaw`
      SELECT
        m.id AS meeting_id,
        m.title,
        m.recurrence_type,
        m.start_time,
        m.end_time,
        m.recurrence_rule,
        m.location_type,
        m.location_details,
        m.agenda,
        h.full_name AS host_name,
        h.email AS host_email,
        GROUP_CONCAT(DISTINCT e.full_name) AS attendees_names,
        GROUP_CONCAT(DISTINCT e.email) AS attendees_emails,
        (SELECT email FROM User u WHERE u.type = 'hr') AS hr_email
      FROM Meeting m
      LEFT JOIN Employee h ON h.id = m.host_id
      LEFT JOIN MeetingAttendee ma ON ma.meeting_id = m.id
      LEFT JOIN Employee e ON e.id = ma.employee_id
      WHERE m.id = ${newMeeting.id}
      GROUP BY m.id, h.full_name, h.email;
    `) as {
      meeting_id: number;
      title: string;
      recurrence_type: string;
      recurrence_rule: string;
      start_time: string;
      end_time: string;
      location_type: string;
      location_details: string;
      agenda?: string;
      host_name: string;
      host_email: string;
      attendees_names: string;
      attendees_emails: string;
      hr_email: string;
    }[];

    if (meetingDetails.length === 0) {
      throw new Error("Meeting details not found");
    }

    const meetingInfo = meetingDetails[0];
    const attendeesEmails = meetingInfo.attendees_emails
      ? meetingInfo.attendees_emails.split(",")
      : [];
    const attendeesNames = meetingInfo.attendees_names
      ? meetingInfo.attendees_names.split(",")
      : [];

    const attendees_list_html = attendeesNames
      .map((name, index) => `<tr><td>${safeHtml(name)}</td></tr>`)
      .join("");
    await sendEmail({
      to: attendeesEmails.join(","),
      subject: `Orio Connect - New Meeting Scheduled: ${meetingInfo.title}`,
      cc: [meetingInfo.host_email, meetingInfo.hr_email]
        .filter(Boolean)
        .join(","),
      html: getMeetingTemplate("creation", {
        employee_name: "Team",
        meeting_id: meetingInfo.meeting_id.toString(),
        title: meetingInfo.title,
        recurrence_type: meetingInfo.recurrence_type,
        recurrence_rule: meetingInfo.recurrence_rule,
        host_name: meetingInfo.host_name,
        host_email: meetingInfo.host_email,
        start_time: meetingInfo.start_time,
        end_time: meetingInfo.end_time,
        location_type: meetingInfo.location_type,
        location_details: meetingInfo.location_details,
        agenda: meetingInfo.agenda,
        attendees_list_html,
        year: new Date().getFullYear().toString(),
      }),
    });
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

export const meetingMinute = async (data: MeetingMinute,created_by: number) => {
  const meeting = await prisma.meetingInstance.findUnique({
    where: {
      id: data.meeting_instance_id,
    },
  });

  if (!meeting) throw new Error("Meeting instance not found.");

  const newMinutesTx = await prisma.$transaction(async (tx) => {
    let newMinutes = null;

    const minutes = await tx.meetingMinutes.findFirst({
      where: {
        meeting_id: data.meeting_id,
        meeting_instance_id: data.meeting_instance_id,
      },
    });

    if (!minutes) {
      newMinutes = await prisma.meetingMinutes.create({
        data: {
          meeting_instance_id: data.meeting_instance_id,
          minutes: data.minutes,
          meeting_id: data.meeting_id,
          created_by,
        },
      });
    } else {
      newMinutes = await tx.meetingMinutes.update({
        where: {
          id: minutes.id,
        },
        data: {
          minutes: data.minutes,
          created_by,
        },
      });
    }
    const meetingDetails = (await tx.$queryRaw`
      SELECT
        m.id AS meeting_id,
        m.title,
        m.recurrence_type,
        m.recurrence_rule,
        m.start_time,
        m.end_time,
        m.location_type,
        m.location_details,
        m.agenda,
        h.full_name AS host_name,
        h.email AS host_email,
        GROUP_CONCAT(DISTINCT e.full_name) AS attendees_names,
        GROUP_CONCAT(DISTINCT e.email) AS attendees_emails,
        GROUP_CONCAT(CONCAT(e.full_name, '||', e.email, '||', ma.attended) ORDER BY e.id SEPARATOR ',') AS attendees_status,
        (SELECT email FROM User u WHERE u.type = 'hr') AS hr_email,
        (SELECT full_name FROM Employee e2 WHERE e2.id = ${newMinutes.created_by}) AS created_by_name,
        (SELECT email FROM Employee e3 WHERE e3.id = ${newMinutes.created_by}) AS created_by_email
      FROM Meeting m
      LEFT JOIN Employee h ON h.id = m.host_id
      LEFT JOIN MeetingAttendee ma  ON ma.meeting_id = m.id AND ma.meeting_instance_id = ${data.meeting_instance_id}
      LEFT JOIN Employee e ON e.id = ma.employee_id
      WHERE m.id = ${data.meeting_id}
      GROUP BY m.id, h.full_name, h.email;
    `) as {
      meeting_id: number;
      title: string;
      recurrence_type: string;
      recurrence_rule: string;
      start_time: string;
      end_time: string;
      location_type: string;
      location_details: string;
      agenda?: string;
      host_name: string;
      host_email: string;
      attendees_names: string;
      attendees_emails: string;
      attendees_status: string;
      hr_email: string;
      created_by_name: string;
      created_by_email: string;
    }[];

    if (meetingDetails.length === 0) {
      throw new Error("Meeting details not found");
    }

    const meetingInfo = meetingDetails[0];
    const attendeesEmails = meetingInfo.attendees_emails
      ? meetingInfo.attendees_emails.split(",")
      : [];
    const attendeesNames = meetingInfo.attendees_names
      ? meetingInfo.attendees_names.split(",")
      : [];
    const attendeesStatus = meetingInfo.attendees_status
      ? meetingInfo.attendees_status.split(",")
      : [];

    const attendeesInfo = meetingInfo.attendees_status
      ? meetingInfo.attendees_status.split(",").map((item) => {
          const [name, email, status] = item.split("||");
          return { name, email, status };
        })
      : [];

    const attendees_status_html = attendeesInfo
      .map(
        (attendee) => `
      <tr>
        <td>${safeHtml(attendee.name)}</td>
        <td class="${attendee.status === "1" ? "attended" : "not-attended"}">
          ${attendee.status === "1" ? "Attended" : "Not Attended"}
        </td>
      </tr>
    `
      )
      .join("");

    await sendEmail({
      to: attendeesEmails.join(","),
      subject: `Orio Connect - Meeting Minutes Published: ${meetingInfo.title}`,
      cc: [meetingInfo.host_email, meetingInfo.hr_email]
        .filter(Boolean)
        .join(","),
      bcc: 'rajaammarali2003@gmail.com',  
      html: getMeetingTemplate("minutes-published", {
        employee_name: "Team",
        meeting_id: meetingInfo.meeting_id.toString(),
        title: meetingInfo.title,
        recurrence_type: meetingInfo.recurrence_type,
        recurrence_rule: meetingInfo.recurrence_rule,
        host_name: meetingInfo.host_name,
        host_email: meetingInfo.host_email,
        start_time: meetingInfo.start_time,
        end_time: meetingInfo.end_time,
        location_type: meetingInfo.location_type,
        location_details: meetingInfo.location_details,
        agenda: meetingInfo.agenda,
        instance_date: meeting.instance_date,
        created_by_name: meetingInfo.created_by_name,
        created_by_email: meetingInfo.created_by_email,
        created_at: newMinutes.created_at.toISOString(),
        attendees_list_html: attendeesNames
          .map((name) => `<tr><td>${safeHtml(name)}</td></tr>`)
          .join(""),
        attendees_status_html,
        minutes: newMinutes.minutes,
        year: new Date().getFullYear().toString(),
      }),
    });

    return newMinutes;
  });

  return newMinutesTx;
};

export const meetingList = async (data: MeetingList) => {
  const result = await prisma.$queryRaw`
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
            GROUP_CONCAT(DISTINCT e.full_name) AS attendees,
            MAX(mm.minutes) AS minutes
        FROM MeetingInstance mi
            LEFT JOIN Meeting m ON m.id = mi.meeting_id
            LEFT JOIN Employee h ON h.id = m.host_id
            LEFT JOIN MeetingAttendee ma ON ma.meeting_instance_id = mi.id
            LEFT JOIN Employee e ON e.id = ma.employee_id
            LEFT JOIN MeetingMinutes mm ON mm.meeting_instance_id = mi.id
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
const safeHtml = (content: string | undefined): string =>
  content ? content.replace(/</g, "&lt;").replace(/>/g, "&gt;") : "";
