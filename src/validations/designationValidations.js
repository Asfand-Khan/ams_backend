"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.designationUpdateSchema = exports.designationSchema = void 0;
const zod_1 = require("zod");
exports.designationSchema = zod_1.z.object({
    title: zod_1.z
        .string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
    })
        .min(1, { message: "Title cannot be empty" })
        .max(100, { message: "Title must not exceed 100 characters" })
        .toLowerCase(),
    level: zod_1.z
        .number({
        required_error: "Level is required",
        invalid_type_error: "Level must be a number",
    })
        .int({ message: "Level must be an integer" }),
    description: zod_1.z
        .string({ invalid_type_error: "Description must be a string" })
        .toLowerCase()
        .optional()
        .nullable(),
    department_id: zod_1.z
        .number({ invalid_type_error: "Department ID must be a number" })
        .int({ message: "Department ID must be an integer" })
        .optional()
        .nullable(),
});
exports.designationUpdateSchema = exports.designationSchema.extend({
    designation_id: zod_1.z
        .number({ required_error: "Designation ID is required" })
        .int({ message: "Designation ID must be an integer" }),
});
