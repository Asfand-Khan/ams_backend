"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpSchema = exports.sendOtpSchema = exports.loginSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.loginSchema = zod_1.default.object({
    username: zod_1.default
        .string({ required_error: "Username is required" })
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters")
        .toLowerCase(),
    password: zod_1.default
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters"),
});
exports.sendOtpSchema = zod_1.default.object({
    username: zod_1.default
        .string({ required_error: "Username is required" })
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters")
        .toLowerCase(),
});
exports.verifyOtpSchema = zod_1.default.object({
    username: zod_1.default
        .string({ required_error: "Username is required" })
        .min(3, "Username must be at least 3 characters")
        .max(100, "Username must be at most 100 characters")
        .toLowerCase(),
    otp: zod_1.default
        .number({ required_error: "OTP is required" })
        .refine((val) => val >= 100000 && val <= 999999, "OTP must be a 6-digit number"),
});
