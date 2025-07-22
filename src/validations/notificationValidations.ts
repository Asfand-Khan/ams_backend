import z from "zod";

export const createNotificationSchema = z.object({
  title: z
    .string({ required_error: "Title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters")
    .toUpperCase(),
  message: z.string({ required_error: "Message is required" }).toLowerCase(),
  type: z.enum(
    ["attendance", "leave", "shift", "general", "alert", "holiday"],
    {
      required_error: "Type is required",
    }
  ),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Priority is required",
  }),
  user_id: z
    .number({ required_error: "User ID is required" })
    .int({ message: "User ID must be an integer" })
    .positive({ message: "User ID must be a positive number" })
    .nullable()
    .optional(),
});

export type CreateNotification = z.infer<typeof createNotificationSchema>;