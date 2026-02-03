import { z } from "zod";

const baseHolidaySchema = z.object({
  start_date: z
    .string({
      required_error: "Start date is required.",
      invalid_type_error:
        "Start date must be a valid date string (YYYY-MM-DD).",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Start date must be a valid date (e.g., 2025-12-25).",
    }),

  end_date: z
    .string({
      required_error: "End date is required.",
      invalid_type_error: "End date must be a valid date string (YYYY-MM-DD).",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "End date must be a valid date (e.g., 2025-12-25).",
    }),

  title: z
    .string({
      required_error: "Title is required.",
      invalid_type_error: "Title must be a string.",
    })
    .min(1, "Title cannot be empty.")
    .max(100, "Title must be at most 100 characters long."),

  description: z
    .string({
      invalid_type_error: "Description must be a string.",
    })
    .optional(),
  notification_title: z.string().optional().default("New Holiday Announced!"),
  notification_message: z
    .string()
    .optional()
    .default(
      "A new holiday has been declared. Check your calendar for details.",
    ),
});

export const holidaySchema = baseHolidaySchema.refine(
  (data) => {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return end >= start;
  },
  {
    message: "End date must be greater than or equal to start date.",
    path: ["end_date"],
  },
);

export const holidayUpdateSchema = baseHolidaySchema
  .partial()
  .extend({
    holiday_id: z
      .number({
        required_error: "Holiday ID is required for update.",
        invalid_type_error: "Holiday ID must be a number.",
      })
      .positive("Holiday ID must be a positive number."),
  })
  .refine(
    (data) => {
      // If both dates are provided, check range
      if (data.start_date && data.end_date) {
        const start = new Date(data.start_date);
        const end = new Date(data.end_date);
        return end >= start;
      }
      return true;
    },
    {
      message: "End date must be greater than or equal to start date.",
      path: ["end_date"],
    },
  );

export type Holiday = z.infer<typeof holidaySchema>;
export type HolidayUpdate = z.infer<typeof holidayUpdateSchema>;
