import z from "zod";

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
  .refine((val) => val >= 100000 && val <= 999999, "OTP must be a 6-digit number"),
});

export type Login = z.infer<typeof loginSchema>;
export type SendOtp = z.infer<typeof sendOtpSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;