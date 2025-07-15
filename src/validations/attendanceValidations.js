"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOutSchema = exports.checkInSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const localDateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
exports.checkInSchema = zod_1.default.object({
    employee_id: zod_1.default
        .number({ required_error: "Employee ID is required" })
        .int("Employee ID must be an integer")
        .positive("Employee ID must be a positive number"),
    attendance_date: zod_1.default
        .string({ required_error: "Attendance date is required" })
        .regex(localDateTimeRegex, "Attendance date must be in 'YYYY-MM-DD HH:mm:ss' format")
        .refine((val) => new Date(val).getTime() <= Date.now(), "Attendance date cannot be in the future"),
    check_in_time: zod_1.default
        .string({ required_error: "Check-in time is required" })
        .regex(localDateTimeRegex, "Check-in time must be in 'YYYY-MM-DD HH:mm:ss' format")
        .refine((val) => new Date(val).getTime() <= Date.now(), "Check-in time cannot be in the future"),
    check_in_office_location: zod_1.default
        .number({ required_error: "Check-in office location is required" })
        .int("Check-in office location must be an integer")
        .positive("Check-in office location must be a positive number"),
});
exports.checkOutSchema = zod_1.default.object({
    employee_id: zod_1.default
        .number({ required_error: "Employee ID is required" })
        .int("Employee ID must be an integer")
        .positive("Employee ID must be a positive number"),
    attendance_date: zod_1.default
        .string({ required_error: "Attendance date is required" })
        .regex(localDateTimeRegex, "Attendance date must be in 'YYYY-MM-DD HH:mm:ss' format")
        .refine((val) => new Date(val).getTime() <= Date.now(), "Attendance date cannot be in the future"),
    check_out_time: zod_1.default
        .string({ required_error: "Check-out time is required" })
        .regex(localDateTimeRegex, "Check-out time must be in 'YYYY-MM-DD HH:mm:ss' format")
        .refine((val) => new Date(val).getTime() <= Date.now(), "Check-out time cannot be in the future"),
    check_out_office_location: zod_1.default
        .number({ required_error: "Check-out office location is required" })
        .int("Check-out office location must be an integer")
        .positive("Check-out office location must be a positive number"),
});
