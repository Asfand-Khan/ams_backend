import { z } from "zod";

export const leaveTypeSchema = z.object({
  name: z.string({
    required_error: "Leave type name is required",
    invalid_type_error: "Leave type name must be a string",
  }),
  total_quota: z
    .number({
      required_error: "Total quota is required",
      invalid_type_error: "Total quota must be a number",
    })
    .min(0),
});

export const leaveTypeUpdateSchema = leaveTypeSchema.extend({
  leave_type_id: z
    .number({
      required_error: "Leave type ID is required",
      invalid_type_error: "Leave type ID must be a number",
    })
    .int("Leave type ID must be an integer"),
});

export type LeaveType = z.infer<typeof leaveTypeSchema>;
export type LeaveTypeUpdate = z.infer<typeof leaveTypeUpdateSchema>;