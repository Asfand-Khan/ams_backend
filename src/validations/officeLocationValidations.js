"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.officeLocationSchema = void 0;
const zod_1 = require("zod");
exports.officeLocationSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Office name is required.",
        invalid_type_error: "Office name must be a string.",
    })
        .min(1, "Office name cannot be empty.")
        .max(100, "Office name must be at most 100 characters.")
        .toLowerCase(),
    latitude: zod_1.z
        .string({
        required_error: "Latitude is required.",
        invalid_type_error: "Latitude must be a string.",
    })
        .refine((val) => /^-?\d+(\.\d+)?$/.test(val), "Latitude must be a valid number string."),
    longitude: zod_1.z
        .string({
        required_error: "Longitude is required.",
        invalid_type_error: "Longitude must be a string.",
    })
        .refine((val) => /^-?\d+(\.\d+)?$/.test(val), "Longitude must be a valid number string."),
    radius_meters: zod_1.z
        .number({
        required_error: "Radius in meters is required.",
        invalid_type_error: "Radius must be a number.",
    })
        .int("Radius must be an integer.")
        .min(1, "Radius must be at least 1 meter."),
    address: zod_1.z
        .string({
        invalid_type_error: "Address must be a string.",
    })
        .max(1000, "Address must be at most 1000 characters.")
        .toLowerCase()
        .optional()
        .nullable(),
});
const officeLocationUpdateSchema = exports.officeLocationSchema.extend({
    office_id: zod_1.z
        .number({
        required_error: "Office ID is required.",
        invalid_type_error: "Office ID must be a number.",
    })
        .int("Office ID must be an integer."),
});
