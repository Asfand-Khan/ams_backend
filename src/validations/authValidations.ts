import z, { string } from "zod";

export const loginSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters")
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

export const sendOtpSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters")
    .toLowerCase(),
});

export const verifyOtpSchema = z.object({
  username: z
    .string({ required_error: "Username is required" })
    .min(3, "Username must be at least 3 characters")
    .max(100, "Username must be at most 100 characters")
    .toLowerCase(),
  otp: z
    .number({ required_error: "OTP is required" })
    .refine(
      (val) => val >= 100000 && val <= 999999,
      "OTP must be a 6-digit number"
    ),
});

export const forgetPasswordSchema = z.object({
  employee_email: z
    .string({ required_error: "Employee email is required" })
    .email("Invalid email format"),
});

export const createFCMToken = z.object({
  employee_id: z
    .number({ required_error: "Employee ID is required" })
    .int("Employee ID must be an integer")
    .positive("Employee ID must be a positive number"),
  token: z
    .string({ required_error: "Token is required" })
    .min(3, "Token must be at least 3 characters"),
});

export type Login = z.infer<typeof loginSchema>;
export type SendOtp = z.infer<typeof sendOtpSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;
export type ForgetPassword = z.infer<typeof forgetPasswordSchema>;
export type FCMToken = z.infer<typeof createFCMToken>;