import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

const isValidPastOrTodayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() <= today.getTime();
};

export const attendanceCorrectionCreateSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(dateRegex, "Attendance date must be in 'YYYY-MM-DD' format")
    .refine(isValidPastOrTodayDate, "Attendance date cannot be in the future"),

  request_type: z.enum(
    ["missed_check_in", "missed_check_out", "wrong_time", "both"],
    {
      required_error: "Request type is required",
    }
  ),

  requested_check_in_time: z
    .string({ required_error: "Check-in time is required" })
    .regex(timeRegex, "Check-in time must be in 'HH:mm:ss' 24-hour format"),

  requested_check_out_time: z
    .string({ required_error: "Check-out time is required" })
    .regex(timeRegex, "Check-out time must be in 'HH:mm:ss' 24-hour format"),

  reason: z.string({ required_error: "Reason is required" }),
});

export type AttendanceCorrectionCreate = z.infer<
  typeof attendanceCorrectionCreateSchema
>;
