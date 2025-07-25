import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

const isValidPastOrTodayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.getDate() <= today.getDate();
};

export const checkInSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(dateRegex, "Attendance date must be in 'YYYY-MM-DD' format")
    .refine(isValidPastOrTodayDate, "Attendance date cannot be in the future"),

  check_in_time: z
    .string({ required_error: "Check-in time is required" })
    .regex(timeRegex, "Check-in time must be in 'HH:mm:ss' 24-hour format"),

  check_in_office_location: z
    .number({ required_error: "Check-in office location is required" })
    .int("Check-in office location must be an integer")
    .positive("Check-in office location must be a positive number"),
});

export const checkOutSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(dateRegex, "Attendance date must be in 'YYYY-MM-DD' format")
    .refine(isValidPastOrTodayDate, "Attendance date cannot be in the future"),

  check_out_time: z
    .string({ required_error: "Check-in time is required" })
    .regex(timeRegex, "Check-in time must be in 'HH:mm:ss' 24-hour format"),

  check_out_office_location: z
    .number({ required_error: "Check-out office location is required" })
    .int("Check-out office location must be an integer")
    .positive("Check-out office location must be a positive number"),
});

export const singleAttendanceSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(dateRegex, "Attendance date must be in 'YYYY-MM-DD' format")
    .refine(isValidPastOrTodayDate, "Attendance date cannot be in the future"),
});

export const attendanceSummarySchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  start_date: z
    .string({ required_error: "Start date is required" })
    .regex(dateRegex, "Start date must be in 'YYYY-MM-DD' format"),

  end_date: z
    .string({ required_error: "End date is required" })
    .regex(dateRegex, "End date must be in 'YYYY-MM-DD' format"),
});

export const attendanceSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  start_date: z
    .string({ required_error: "Start date is required" })
    .regex(dateRegex, "Start date must be in 'YYYY-MM-DD' format"),

  end_date: z
    .string({ required_error: "End date is required" })
    .regex(dateRegex, "End date must be in 'YYYY-MM-DD' format"),
});

export const createAttendanceSchema = z.object({
  employee_id: z
    .number({ message: "Employee ID is required" })
    .int({ message: "Employee ID must be an integer" })
    .positive({ message: "Employee ID must be a positive number" }),

  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(dateRegex, "Start date must be in 'YYYY-MM-DD' format"),

  check_in_time: z
    .string({ required_error: "Check-in time is required" })
    .regex(timeRegex, "Check-in time must be in 'HH:mm:ss' 24-hour format")
    .nullable()
    .optional(),

  check_out_time: z
    .string({ required_error: "Check-out time is required" })
    .regex(timeRegex, "Check-out time must be in 'HH:mm:ss' 24-hour format")
    .nullable()
    .optional(),
});

export const updateAttendanceSchema = z.object({
  attendance_id: z
    .number({ message: "Attendance ID is required" })
    .int({ message: "Attendance ID must be an integer" })
    .positive({ message: "Attendance ID must be a positive number" }),

  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(dateRegex, "Start date must be in 'YYYY-MM-DD' format"),

  check_in_time: z
    .string({ required_error: "Check-in time is required" })
    .regex(timeRegex, "Check-in time must be in 'HH:mm:ss' 24-hour format")
    .nullable()
    .optional(),

  check_out_time: z
    .string({ required_error: "Check-out time is required" })
    .regex(timeRegex, "Check-out time must be in 'HH:mm:ss' 24-hour format")
    .nullable()
    .optional(),
});

export const attendanceByDateSchema = z.object({
  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(dateRegex, "Attendance date must be in 'YYYY-MM-DD' format"),
});

export const attendanceByIdSchema = z.object({
  attendance_id: z
    .number({ message: "Attendance ID is required" })
    .int({ message: "Attendance ID must be an integer" })
    .positive({ message: "Attendance ID must be a positive number" }),
});

export type CheckIn = z.infer<typeof checkInSchema>;
export type CheckOut = z.infer<typeof checkOutSchema>;
export type SingleAttendance = z.infer<typeof singleAttendanceSchema>;
export type AttendanceSummary = z.infer<typeof attendanceSummarySchema>;
export type Attendance = z.infer<typeof attendanceSchema>;
export type CreateAttendance = z.infer<typeof createAttendanceSchema>;
export type UpdateAttendance = z.infer<typeof updateAttendanceSchema>;
export type AttendanceByDate = z.infer<typeof attendanceByDateSchema>;
export type AttendanceById = z.infer<typeof attendanceByIdSchema>;