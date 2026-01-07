import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

export const meetingSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(100, { message: "Title cannot exceed 100 characters." })
    .describe("Title of the meeting"),

  recurrence_rule: z.enum(
    [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    {
      errorMap: () => ({
        message:
          "Recurrence rule must be one of: monday, tuesday, wednesday, thursday, friday, saturday, sunday.",
      }),
    }
  ),

  recurrence_type: z
    .enum(["one_time", "weekly", "monthly", "daily"], {
      errorMap: () => ({
        message:
          "Recurrence type must be one of: one_time, weekly, monthly, daily.",
      }),
    })
    .default("one_time"),

  start_time: z
    .string({ required_error: "Start time is required" })
    .regex(timeRegex, "Start time must be in 'HH:mm:ss' 24-hour format"),

  end_time: z
    .string({ required_error: "End time is required" })
    .regex(timeRegex, "End time must be in 'HH:mm:ss' 24-hour format"),

  recurrence_start_date: z
    .string({ required_error: "Recurrence start date is required" })
    .regex(dateRegex, "Recurrence start date must be in 'YYYY-MM-DD' format"),

  recurrence_end_date: z
    .string({ required_error: "Recurrence end date is required" })
    .regex(dateRegex, "Recurrence end date must be in 'YYYY-MM-DD' format"),

  host_id: z
    .number()
    .int({ message: "Host ID must be an integer." })
    .positive({ message: "Host ID must be a positive number." }),

  location_type: z.enum(["physical", "online"], {
    errorMap: () => ({
      message: "Location type must be either 'physical' or 'online'.",
    }),
  }),

  location_details: z
    .string()
    .min(5, { message: "Location details must be at least 5 characters." })
    .describe("Physical room name/address or online meeting URL"),

  agenda: z
    .string()
    .max(5000, { message: "Agenda cannot exceed 5000 characters." })
    .optional(),

  attendees: z.array(
    z
      .number()
      .int({ message: "Attendees must be integers." })
      .positive({ message: "Attendees must be positive integers." }),
    {
      errorMap: () => ({
        message: "Attendees must be an array of integers.",
      }),
    }
  ),

  status: z
    .enum(["scheduled", "in_progress", "completed", "cancelled"], {
      errorMap: () => ({
        message:
          "Status must be one of: scheduled, in_progress, completed, cancelled.",
      }),
    })
    .default("scheduled"),
});

export const attendMeetingSchema = z.object({
  meeting_id: z
    .number()
    .int({ message: "Meeting ID must be an integer." })
    .positive({ message: "Meeting ID must be a positive number." }),
  meeting_instance_id: z
    .number()
    .int({ message: "Meeting Instance ID must be an integer." })
    .positive({ message: "Meeting Instance ID must be a positive number." }),
  employee_id: z
    .number()
    .int({ message: "Employee ID must be an integer." })
    .positive({ message: "Employee ID must be a positive number." }),
});

export const meetingMinuteSchema = z.object({
  meeting_id: z
    .number()
    .int({ message: "Meeting ID must be an integer." })
    .positive({ message: "Meeting ID must be a positive number." }),
  meeting_instance_id: z
    .number()
    .int({ message: "Meeting Instance ID must be an integer." })
    .positive({ message: "Meeting Instance ID must be a positive number." }),
  minutes: z
    .string({ required_error: "Minutes are required." })
    .min(5, { message: "Minutes must be at least 5 characters." }),
});

export const meetingListSchema = z.object({
  end_date: z
    .string({ required_error: "End date is required" })
    .regex(dateRegex, "End date must be in 'YYYY-MM-DD' format")
    .nullable()
    .optional(),
  employee_id: z
    .number()
    .int({ message: "Employee ID must be an integer." })
    .positive({ message: "Employee ID must be a positive number." })
    .nullable()
    .optional(),
});

export const meetingInstanceListSchema = z.object({
  meeting_id: z
    .number()
    .int({ message: "Meeting ID must be an integer." })
    .positive({ message: "Meeting ID must be a positive number." }),
});

export const meetingInstanceStatusSchema = z.object({
  meeting_instance_id: z
    .number()
    .int({ message: "Meeting Instance ID must be an integer." })
    .positive({ message: "Meeting Instance ID must be a positive number." }),
});

export const updateMeetingSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." })
    .max(100, { message: "Title cannot exceed 100 characters." })
    .describe("Title of the meeting")
    .optional(),

  host_id: z
    .number()
    .int({ message: "Host ID must be an integer." })
    .positive({ message: "Host ID must be a positive number." })
    .optional(),

  location_type: z
    .enum(["physical", "online"], {
      errorMap: () => ({
        message: "Location type must be either 'physical' or 'online'.",
      }),
    })
    .optional(),

  location_details: z
    .string()
    .min(5, { message: "Location details must be at least 5 characters." })
    .describe("Physical room name/address or online meeting URL")
    .optional(),

  agenda: z
    .string()
    .max(5000, { message: "Agenda cannot exceed 5000 characters." })
    .optional(),

  attendees: z
    .array(
      z
        .number()
        .int({ message: "Attendees must be integers." })
        .positive({ message: "Attendees must be positive integers." }),
      {
        errorMap: () => ({
          message: "Attendees must be an array of integers.",
        }),
      }
    )
    .optional(),
});

export const updateMeetingInstanceSchema = z.object({
  meeting_instance_id: z
    .number()
    .int({ message: "Meeting Instance ID must be an integer." })
    .positive({ message: "Meeting Instance ID must be a positive number." }),
  instance_date: z
    .string()
    .regex(dateRegex, "Instance date must be in 'YYYY-MM-DD' format")
    .optional(),

  start_time: z
    .string()
    .regex(timeRegex, "Start time must be in 'HH:mm:ss' 24-hour format")
    .optional(),

  end_time: z
    .string()
    .regex(timeRegex, "End time must be in 'HH:mm:ss' 24-hour format")
    .optional(),

  attendees: z
    .array(
      z
        .number()
        .int({ message: "Attendees must be integers." })
        .positive({ message: "Attendees must be positive integers." }),
      {
        errorMap: () => ({
          message: "Attendees must be an array of integers.",
        }),
      }
    )
    .optional(),
});

export type Meeting = z.infer<typeof meetingSchema>;
export type AttendMeeting = z.infer<typeof attendMeetingSchema>;
export type MeetingMinute = z.infer<typeof meetingMinuteSchema>;
export type MeetingList = z.infer<typeof meetingListSchema>;
export type MeetingInstanceList = z.infer<typeof meetingInstanceListSchema>;
export type MeetingInstanceStatus = z.infer<typeof meetingInstanceStatusSchema>;
export type UpdateMeeting = z.infer<typeof updateMeetingSchema>;
export type UpdateMeetingInstance = z.infer<typeof updateMeetingInstanceSchema>;
