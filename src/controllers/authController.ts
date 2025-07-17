import { Request, Response } from "express";
import {
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/authValidations";
import {
  comparePassword,
  generateOTP,
  getUserByUsername,
  verifyOTP,
} from "../services/authServices";
import { sendEmail } from "../utils/sendEmail";
import { generateToken } from "../utils/authHelpers";

// Module --> Auth
// Endpoint --> /api/v1/auth/login
// Description --> Authenticate Employee
export const loginHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = loginSchema.parse(req.body);

    const userByUsername = await getUserByUsername(parsedData.username);

    if (!userByUsername) {
      return res.status(400).json({
        status: 0,
        message: "Invalid username or password",
        payload: [],
      });
    }

    const isPasswordValid = comparePassword(
      parsedData.password,
      userByUsername.password_hash
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        status: 0,
        message: "Invalid username or password",
        payload: [],
      });
    }

    await generateOTP(userByUsername.username);

    return res.status(200).json({
      status: 1,
      message: "Login successfully",
      payload: [{ username: userByUsername.username }],
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Auth
// Endpoint --> /api/v1/auth/send-otp
// Description --> Send OTP to Employee
export const sendOtpHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = sendOtpSchema.parse(req.body);

    const userByUsername = await getUserByUsername(parsedData.username);

    if (!userByUsername) {
      return res.status(400).json({
        status: 0,
        message: "Invalid username or password",
        payload: [],
      });
    }

    await sendEmail({
      to: userByUsername.email,
      subject: "Orio Attendance - OTP for login",
      text: "Your OTP is " + userByUsername.otp_token,
    });

    return res.status(200).json({
      status: 1,
      message: "OTP sent successfully",
      payload: [],
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Auth
// Endpoint --> /api/v1/auth/verify-otp
// Description --> Verify OTP to Employee
export const verifyOtpHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = verifyOtpSchema.parse(req.body);

    const userByUsername = await getUserByUsername(parsedData.username);

    if (!userByUsername) {
      return res.status(400).json({
        status: 0,
        message: "Invalid OTP",
        payload: [],
      });
    }

    const isValidOtp = await verifyOTP(
      parsedData.otp,
      Number(userByUsername.otp_token),
      parsedData.username
    );
    if (!isValidOtp) {
      return res.status(400).json({
        status: 0,
        message: "Invalid OTP",
        payload: [],
      });
    }

    // Generate token
    const token = generateToken(userByUsername.employee?.id || 0);

    return res.status(200).json({
      status: 1,
      message: "OTP verified successfully",
      payload: [
        {
          ...userByUsername,
          token,
        },
      ],
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
