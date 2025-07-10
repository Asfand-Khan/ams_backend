import { z } from "zod";

export const designationSchema = z.object({
  title: z
    .string({
      required_error: "Title is required",
      invalid_type_error: "Title must be a string",
    })
    .min(1, { message: "Title cannot be empty" })
    .max(100, { message: "Title must not exceed 100 characters" })
    .toLowerCase(),

  level: z
    .number({
      required_error: "Level is required",
      invalid_type_error: "Level must be a number",
    })
    .int({ message: "Level must be an integer" }),

  description: z
    .string({ invalid_type_error: "Description must be a string" })
    .toLowerCase()
    .optional()
    .nullable(),

  department_id: z
    .number({ invalid_type_error: "Department ID must be a number" })
    .int({ message: "Department ID must be an integer" })
    .optional()
    .nullable(),
});

export const designationUpdateSchema = designationSchema.extend({
  designation_id: z
    .number({ required_error: "Designation ID is required" })
    .int({ message: "Designation ID must be an integer" }),
});

export type Designation = z.infer<typeof designationSchema>;
export type DesignationUpdate = z.infer<typeof designationUpdateSchema>;
