import { z } from "zod";

export const genderEnum = z.enum(["male", "female"], {
  required_error: "Gender is required",
  invalid_type_error: "Gender must be either 'male' or 'female'",
});

export const statusEnum = z.enum(["active", "inactive", "terminated"], {
  required_error: "Status is required",
  invalid_type_error: "Status must be 'active', 'inactive', or 'terminated'",
});

export const employeeSchema = z.object({
  employee_code: z
    .string({ required_error: "Employee code is required" })
    .length(4, "Employee code must be at exactly 4 characters length"),

  full_name: z
    .string({ required_error: "Full name is required" })
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must be at most 100 characters")
    .toLowerCase(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .max(100, "Email must be at most 100 characters")
    .toLowerCase(),

  phone: z
    .string()
    .startsWith("03", "Phone number must start with '03'")
    .length(11, "Phone number must be at exactly 11 characters i.e: 03XXXXXXXXXX")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d$/, "CNIC must be in the format 12345-1234567-1")
    .length(15, "CNIC must be at exactly 15 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  gender: genderEnum.optional(),

  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
    .optional(),

  join_date: z
    .string({ required_error: "Join date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Join date must be in YYYY-MM-DD format"),

  leave_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Leave date must be in YYYY-MM-DD format")
    .optional(),

  department_id: z
    .number({ required_error: "Department ID is required" })
    .int("Department ID must be an integer"),

  designation_id: z
    .number({ required_error: "Designation ID is required" })
    .int("Designation ID must be an integer"),

  profile_picture: z
    .string()
    .url("Profile picture must be a valid URL")
    .max(255, "Profile picture URL is too long")
    .optional(),

  address: z
    .string()
    .max(1000, "Address must be at most 1000 characters")
    .toLowerCase()
    .optional(),

  status: statusEnum.default("active"),
});

export const employeeUpdateSchema = employeeSchema.extend({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer"),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;
