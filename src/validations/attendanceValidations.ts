import z from "zod";

const localDateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const checkInSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  attendance_date: z
    .string({ required_error: "Attendance date is required" })
    .regex(localDateTimeRegex, "Attendance date must be in 'YYYY-MM-DD HH:mm:ss' format")
    .refine(
      (val) => new Date(val).getTime() <= Date.now(),
      "Attendance date cannot be in the future"
    ),

  check_in_time: z
    .string({ required_error: "Check-in time is required" })
    .regex(localDateTimeRegex, "Check-in time must be in 'YYYY-MM-DD HH:mm:ss' format")
    .refine(
      (val) => new Date(val).getTime() <= Date.now(),
      "Check-in time cannot be in the future"
    ),

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
    .regex(localDateTimeRegex, "Attendance date must be in 'YYYY-MM-DD HH:mm:ss' format")
    .refine(
      (val) => new Date(val).getTime() <= Date.now(),
      "Attendance date cannot be in the future"
    ),

  check_out_time: z
    .string({ required_error: "Check-out time is required" })
    .regex(localDateTimeRegex, "Check-out time must be in 'YYYY-MM-DD HH:mm:ss' format")
    .refine(
      (val) => new Date(val).getTime() <= Date.now(),
      "Check-out time cannot be in the future"
    ),

  check_out_office_location: z
    .number({ required_error: "Check-out office location is required" })
    .int("Check-out office location must be an integer")
    .positive("Check-out office location must be a positive number"),
});

export type CheckIn = z.infer<typeof checkInSchema>;
export type CheckOut = z.infer<typeof checkOutSchema>;