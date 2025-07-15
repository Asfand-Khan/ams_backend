import { z } from "zod";

export const holidaySchema = z.object({
  holiday_date: z
    .string({
      required_error: "Holiday date is required.",
      invalid_type_error:
        "Holiday date must be a valid date string (YYYY-MM-DD).",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Holiday date must be a valid date (e.g., 2025-12-25).",
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
});

export const holidayUpdateSchema = holidaySchema.extend({
  holiday_id: z
    .number({
      required_error: "Holiday ID is required for update.",
      invalid_type_error: "Holiday ID must be a number.",
    })
    .positive("Holiday ID must be a positive number."),
});

export type Holiday = z.infer<typeof holidaySchema>;
export type HolidayUpdate = z.infer<typeof holidayUpdateSchema>;
