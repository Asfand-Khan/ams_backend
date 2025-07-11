import { z } from "zod";

// Utility regex for time format "HH:mm:ss" (e.g., "09:00:00")
const timeStringRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;

export const shiftSchema = z
  .object({
    name: z
      .string({
        required_error: "Shift name is required.",
        invalid_type_error: "Shift name must be a string.",
      })
      .min(1, "Shift name cannot be empty.")
      .max(50, "Shift name must not exceed 50 characters.")
      .toLowerCase(),

    start_time: z
      .string({
        required_error: "Start time is required.",
        invalid_type_error: "Start time must be a string in HH:mm:ss format.",
      })
      .regex(timeStringRegex, "Start time must be in HH:mm:ss format."),

    end_time: z
      .string({
        required_error: "End time is required.",
        invalid_type_error: "End time must be a string in HH:mm:ss format.",
      })
      .regex(timeStringRegex, "End time must be in HH:mm:ss format."),

    grace_minutes: z
      .number({
        invalid_type_error: "Grace minutes must be a number.",
      })
      .int("Grace minutes must be an integer.")
      .min(0, "Grace minutes cannot be negative.")
      .default(10),

    half_day_hours: z
      .string({
        required_error: "Half day hours is required.",
        invalid_type_error: "Half day hours must be a string.",
      })
      .refine(
        (val) => !isNaN(parseFloat(val)),
        "Half day hours must be a valid number string."
      )
      .transform((val) => parseFloat(val))
      .refine((val) => val > 0, "Half day hours must be greater than 0."),

    early_leave_threshold_minutes: z
      .number({
        invalid_type_error: "Early leave threshold must be a number.",
      })
      .int("Early leave threshold must be an integer.")
      .min(0, "Early leave threshold cannot be negative.")
      .default(30),

    break_duration_minutes: z
      .number({
        invalid_type_error: "Break duration must be a number.",
      })
      .int("Break duration must be an integer.")
      .min(0, "Break duration cannot be negative.")
      .default(0),
  })
//   .refine(
//     (data) => {
//       const start = Date.parse(`1970-01-01T${data.start_time}Z`);
//       const end = Date.parse(`1970-01-01T${data.end_time}Z`);
//       return end > start;
//     },
//     {
//       message: "End time must be greater than start time.",
//       path: ["end_time"],
//     }
//   );

export const shiftUpdateSchema = shiftSchema.extend({
  shift_id: z
    .number({
      required_error: "Shift ID is required.",
      invalid_type_error: "Shift ID must be a number.",
    })
    .int("Shift ID must be an integer"),
});


export type Shift = z.infer<typeof shiftSchema>;
export type ShiftUpdate = z.infer<typeof shiftUpdateSchema>;