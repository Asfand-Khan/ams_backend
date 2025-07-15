"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.employeeUpdateSchema = exports.employeeSchema = exports.empTypeEnum = exports.statusEnum = exports.genderEnum = void 0;
const zod_1 = require("zod");
exports.genderEnum = zod_1.z.enum(["male", "female"], {
    required_error: "Gender is required",
    invalid_type_error: "Gender must be either 'male' or 'female'",
});
exports.statusEnum = zod_1.z.enum(["active", "inactive", "terminated"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be 'active', 'inactive', or 'terminated'",
});
exports.empTypeEnum = zod_1.z.enum(["employee", "manager", "admin", "hr", "lead"], {
    required_error: "Employee type is required",
    invalid_type_error: "Employee type must be 'employee', 'manager', admin, hr or 'lead'",
});
exports.employeeSchema = zod_1.z.object({
    employee_code: zod_1.z
        .string({ required_error: "Employee code is required" })
        .length(4, "Employee code must be at exactly 4 characters length"),
    username: zod_1.z
        .string({ required_error: "Username is required" })
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters")
        .toLowerCase(),
    full_name: zod_1.z
        .string({ required_error: "Full name is required" })
        .min(3, "Full name must be at least 3 characters")
        .max(100, "Full name must be at most 100 characters")
        .toLowerCase(),
    email: zod_1.z
        .string({ required_error: "Email is required" })
        .email("Invalid email format")
        .max(100, "Email must be at most 100 characters")
        .toLowerCase(),
    emp_type: exports.empTypeEnum.default("employee"),
    phone: zod_1.z
        .string()
        .startsWith("03", "Phone number must start with '03'")
        .length(11, "Phone number must be at exactly 11 characters i.e: 03XXXXXXXXXX")
        .or(zod_1.z.literal("").transform(() => undefined)),
    cnic: zod_1.z
        .string()
        .regex(/^\d{5}-\d{7}-\d$/, "CNIC must be in the format 12345-1234567-1")
        .length(15, "CNIC must be at exactly 15 characters")
        .optional()
        .or(zod_1.z.literal("").transform(() => undefined)),
    gender: exports.genderEnum,
    dob: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth must be in YYYY-MM-DD format")
        .optional(),
    join_date: zod_1.z
        .string({ required_error: "Join date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Join date must be in YYYY-MM-DD format"),
    leave_date: zod_1.z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Leave date must be in YYYY-MM-DD format")
        .optional(),
    department_id: zod_1.z
        .number({ required_error: "Department ID is required" })
        .int("Department ID must be an integer"),
    designation_id: zod_1.z
        .number({ required_error: "Designation ID is required" })
        .int("Designation ID must be an integer"),
    shift_id: zod_1.z
        .number({ required_error: "Shift ID is required" })
        .int("Shift ID must be an integer"),
    team_id: zod_1.z
        .number({ required_error: "Team ID is required" })
        .int("Team ID must be an integer"),
    profile_picture: zod_1.z
        .string()
        .max(255, "Profile picture URL is too long")
        .optional(),
    address: zod_1.z
        .string()
        .max(1000, "Address must be at most 1000 characters")
        .toLowerCase()
        .optional(),
    status: exports.statusEnum.default("active"),
});
exports.employeeUpdateSchema = exports.employeeSchema.extend({
    employee_id: zod_1.z
        .number({ required_error: "Employee ID is required" })
        .int("Employee ID must be an integer"),
});
