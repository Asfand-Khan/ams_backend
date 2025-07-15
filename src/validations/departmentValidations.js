"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentUpdateSchema = exports.DepartmentSchema = void 0;
const zod_1 = require("zod");
exports.DepartmentSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Department name is required",
        invalid_type_error: "Department name must be a string",
    })
        .min(1, "Department name cannot be empty")
        .max(100, "Department name must be at most 100 characters")
        .toLowerCase(),
    description: zod_1.z
        .string({
        invalid_type_error: "Description must be a string",
    })
        .toLowerCase()
        .optional()
        .nullable(),
});
exports.DepartmentUpdateSchema = exports.DepartmentSchema.extend({
    dept_id: zod_1.z
        .number({
        required_error: "Department ID is required",
        invalid_type_error: "Department ID must be a number",
    })
        .int("Department ID must be an integer"),
});
