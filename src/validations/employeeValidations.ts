import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

const isValidPastOrTodayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.getDate() <= today.getDate();
};

export const genderEnum = z.enum(["male", "female"], {
  required_error: "Gender is required",
  invalid_type_error: "Gender must be either 'male' or 'female'",
});

export const statusEnum = z.enum(["active", "inactive", "terminated"], {
  required_error: "Status is required",
  invalid_type_error: "Status must be 'active', 'inactive', or 'terminated'",
});

export const empTypeEnum = z.enum(
  ["employee", "manager", "admin", "hr", "lead"],
  {
    required_error: "Employee type is required",
    invalid_type_error:
      "Employee type must be 'employee', 'manager', admin, hr or 'lead'",
  }
);

export const employeeSchema = z.object({
  employee_code: z
    .string({ required_error: "Employee code is required" })
    .length(4, "Employee code must be at exactly 4 characters length"),

  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters")
    .toLowerCase(),

  full_name: z
    .string({ required_error: "Full name is required" })
    .min(3, "Full name must be at least 3 characters")
    .max(100, "Full name must be at most 100 characters"),

  fathername: z
    .string({ required_error: "Father name is required" })
    .min(3, "Father name must be at least 3 characters")
    .max(100, "Father name must be at most 100 characters")
    .optional()
    .nullable(),

  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .max(100, "Email must be at most 100 characters")
    .toLowerCase(),

  emp_type: empTypeEnum.default("employee"),

  phone: z
    .string()
    .startsWith("03", "Phone number must start with '03'")
    .length(
      11,
      "Phone number must be at exactly 11 characters i.e: 03XXXXXXXXXX"
    )
    .or(z.literal("").transform(() => undefined)),

  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d$/, "CNIC must be in the format 12345-1234567-1")
    .length(15, "CNIC must be at exactly 15 characters")
    .optional()
    .or(z.literal("").transform(() => undefined)),

  gender: genderEnum,

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

  shift_id: z
    .number({ required_error: "Shift ID is required" })
    .int("Shift ID must be an integer"),

  team_id: z
    .number({ required_error: "Team ID is required" })
    .int("Team ID must be an integer"),

  profile_picture: z
    .string()
    .max(255, "Profile picture URL is too long")
    .optional(),

  address: z
    .string()
    .max(1000, "Address must be at most 1000 characters"),

  status: statusEnum.default("active"),
  
  menu_rights: z
    .array(
      z.object({
        menu_id: z.number({
          required_error: "Menu ID is required",
        }),
        can_view: z
          .boolean({
            required_error: "Can view is required",
          })
          .default(true),
        can_create: z
          .boolean({
            required_error: "Can create is required",
          })
          .default(false),
        can_edit: z
          .boolean({
            required_error: "Can edit is required",
          })
          .default(false),
        can_delete: z
          .boolean({
            required_error: "Can delete is required",
          })
          .default(false),
      }),
      { required_error: "Menu rights are required" }
    )
    .nullable()
    .optional(),
});

export const employeeUpdateSchema = employeeSchema.extend({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer"),
});

export const employeeChangePasswordSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer"),
  old_password: z.string({ required_error: "Old password is required" }),
  new_password: z.string({ required_error: "New password is required" }),
});

export const employeeProfileSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer"),
});

export const employeeUpdateProfileSchema = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer"),
  fullname: z
    .string({ invalid_type_error: "Full name must be a string" })
    .max(100, "Full name must be at most 100 characters")
    .toLowerCase()
    .nullable()
    .optional(),
  fathername: z
    .string({ invalid_type_error: "Father name must be a string" })
    .max(100, "Father name must be at most 100 characters")
    .toLowerCase()
    .nullable()
    .optional(),
  dob: z
    .string({ required_error: "DOB is required" })
    .regex(dateRegex, "DOB must be in 'YYYY-MM-DD' format")
    .refine(isValidPastOrTodayDate, "DOB cannot be in the future")
    .nullable()
    .optional(),
  email: z
    .string({ invalid_type_error: "Email must be a string" })
    .email("Invalid email address")
    .toLowerCase()
    .nullable()
    .optional(),
  phone: z
    .string()
    .startsWith("03", "Phone number must start with '03'")
    .length(
      11,
      "Phone number must be at exactly 11 characters i.e: 03XXXXXXXXXX"
    )
    .or(z.literal("").transform(() => undefined))
    .nullable()
    .optional(),
  cnic: z
    .string()
    .regex(/^\d{5}-\d{7}-\d$/, "CNIC must be in the format 12345-1234567-1")
    .length(15, "CNIC must be at exactly 15 characters")
    .optional()
    .or(z.literal("").transform(() => undefined))
    .nullable()
    .optional(),
  address: z
    .string()
    .max(1000, "Address must be at most 1000 characters")
    .toLowerCase()
    .nullable()
    .optional(),
});

export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>;
export type EmployeeChangePassword = z.infer<typeof employeeChangePasswordSchema>;
export type EmployeeProfile = z.infer<typeof employeeProfileSchema>;
export type EmployeeUpdateProfile = z.infer<typeof employeeUpdateProfileSchema>;
