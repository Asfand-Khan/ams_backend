import z from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const overallAttendanceSummarySchema = z.object({
  start_date: z
    .string({ required_error: "Start date is required" })
    .regex(dateRegex, "Start date must be in 'YYYY-MM-DD' format"),

  end_date: z
    .string({ required_error: "End date is required" })
    .regex(dateRegex, "End date must be in 'YYYY-MM-DD' format"),
});

export type OverallAttendanceSummary = z.infer<typeof overallAttendanceSummarySchema>;