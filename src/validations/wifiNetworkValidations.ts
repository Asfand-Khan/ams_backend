import { z } from "zod";

export const OfficeWifiNetworkSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must not exceed 100 characters" })
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be only whitespace",
    }),
  password: z
    .string()
    .max(255, { message: "Password must not exceed 255 characters" })
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .max(65535, { message: "Notes must not exceed 65,535 characters" })
    .optional()
    .or(z.literal("")),
});

export type OfficeWifiNetwork = z.infer<typeof OfficeWifiNetworkSchema>;