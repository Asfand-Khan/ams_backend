import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const leaveSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),

  leave_type_id: z
    .number({ required_error: "Leave Type ID is required" })
    .int("Leave Type ID must be an integer")
    .positive("Leave Type ID must be a positive number"),

  start_date: z
    .string({ required_error: "Start date is required" })
    .regex(dateRegex, "Start date must be in 'YYYY-MM-DD' format"),

  end_date: z
    .string({ required_error: "End date is required" })
    .regex(dateRegex, "End date must be in 'YYYY-MM-DD' format"),

  reason: z.string({ required_error: "Reason is required" }),
});

export const leaveSummarySchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),
});

export const leaveListingSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),
  status: z.enum(["pending", "approved", "rejected"]).nullable().optional(),
});

export const singleLeaveSchema = z.object({
  leave_id: z
    .number({ required_error: "Leave ID is required" })
    .int("Leave ID must be an integer")
    .positive("Leave ID must be a positive number"),
});

export type Leave = z.infer<typeof leaveSchema>;
export type LeaveSummary = z.infer<typeof leaveSummarySchema>;
export type LeaveListing = z.infer<typeof leaveListingSchema>;
export type SingleLeave = z.infer<typeof singleLeaveSchema>;