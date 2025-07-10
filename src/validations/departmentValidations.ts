import { z } from "zod";

export const DepartmentSchema = z.object({
  name: z
    .string({
      required_error: "Department name is required",
      invalid_type_error: "Department name must be a string",
    })
    .min(1, "Department name cannot be empty")
    .max(100, "Department name must be at most 100 characters")
    .toLowerCase(),

  description: z
    .string({
      invalid_type_error: "Description must be a string",
    })
    .toLowerCase()
    .optional()
    .nullable(),
});

export const DepartmentUpdateSchema = DepartmentSchema.extend({
  dept_id: z
    .number({
      required_error: "Department ID is required",
      invalid_type_error: "Department ID must be a number",
    })
    .int("Department ID must be an integer"),
});

export type Department = z.infer<typeof DepartmentSchema>;
export type DepartmentUpdate = z.infer<typeof DepartmentUpdateSchema>;
