"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.holidayUpdateSchema = exports.holidaySchema = void 0;
const zod_1 = require("zod");
exports.holidaySchema = zod_1.z.object({
    holiday_date: zod_1.z
        .string({
        required_error: "Holiday date is required.",
        invalid_type_error: "Holiday date must be a valid date string (YYYY-MM-DD).",
    })
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Holiday date must be a valid date (e.g., 2025-12-25).",
    }),
    title: zod_1.z
        .string({
        required_error: "Title is required.",
        invalid_type_error: "Title must be a string.",
    })
        .min(1, "Title cannot be empty.")
        .max(100, "Title must be at most 100 characters long."),
    description: zod_1.z
        .string({
        invalid_type_error: "Description must be a string.",
    })
        .optional(),
});
exports.holidayUpdateSchema = exports.holidaySchema.extend({
    holiday_id: zod_1.z
        .number({
        required_error: "Holiday ID is required for update.",
        invalid_type_error: "Holiday ID must be a number.",
    })
        .positive("Holiday ID must be a positive number."),
});
