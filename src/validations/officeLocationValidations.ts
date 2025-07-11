import { z } from "zod";

export const officeLocationSchema = z.object({
  name: z
    .string({
      required_error: "Office name is required.",
      invalid_type_error: "Office name must be a string.",
    })
    .min(1, "Office name cannot be empty.")
    .max(100, "Office name must be at most 100 characters.")
    .toLowerCase(),

  latitude: z
    .string({
      required_error: "Latitude is required.",
      invalid_type_error: "Latitude must be a string.",
    })
    .refine(
      (val) => /^-?\d+(\.\d+)?$/.test(val),
      "Latitude must be a valid number string."
    ),

  longitude: z
    .string({
      required_error: "Longitude is required.",
      invalid_type_error: "Longitude must be a string.",
    })
    .refine(
      (val) => /^-?\d+(\.\d+)?$/.test(val),
      "Longitude must be a valid number string."
    ),

  radius_meters: z
    .number({
      required_error: "Radius in meters is required.",
      invalid_type_error: "Radius must be a number.",
    })
    .int("Radius must be an integer.")
    .min(1, "Radius must be at least 1 meter."),

  address: z
    .string({
      invalid_type_error: "Address must be a string.",
    })
    .max(1000, "Address must be at most 1000 characters.")
    .toLowerCase()
    .optional()
    .nullable(),
});

const officeLocationUpdateSchema = officeLocationSchema.extend({
  office_id: z
    .number({
      required_error: "Office ID is required.",
      invalid_type_error: "Office ID must be a number.",
    })
    .int("Office ID must be an integer."),
});

export type OfficeLocation = z.infer<typeof officeLocationSchema>;
export type OfficeLocationUpdate = z.infer<typeof officeLocationUpdateSchema>;