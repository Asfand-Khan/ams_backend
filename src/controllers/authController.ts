import { Request, Response } from "express";
import {
  createFCMToken,
  forgetPasswordSchema,
  loginSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from "../validations/authValidations";
import {
  comparePassword,
  createToken,
  generateOTP,
  getUserByEmail,
  getUserByEmployeeId,
  getUserByUsername,
  getUserMenus,
  verifyOTP,
} from "../services/authServices";
import { sendEmail } from "../utils/sendEmail";
import { generateToken } from "../utils/authHelpers";
import { handleAppError } from "../utils/appErrorHandler";
import { getOTPTemplate } from "../utils/otpTemplate";
import { getForgotPasswordTemplate } from "../utils/forgetPassword";

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
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
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
      subject: "Orio Connect - OTP for login",
      html: getOTPTemplate(
        userByUsername.otp_token,
        userByUsername.employee?.full_name || userByUsername.username
      ),
    });

    return res.status(200).json({
      status: 1,
      message: "OTP sent successfully",
      payload: [],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
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

    const menus = await getUserMenus(userByUsername.id);

    return res.status(200).json({
      status: 1,
      message: "OTP verified successfully",
      payload: [
        {
          token,
          ...userByUsername,
          menus,
        },
      ],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Auth
// Endpoint --> /api/v1/auth/forget-password
// Description --> Send password to Employee
export const forgetPasswordHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = forgetPasswordSchema.parse(req.body);

    const user = await getUserByEmail(parsedData.employee_email);
    if (!user) {
      return res.status(400).json({
        status: 0,
        message: "User not found",
        payload: [],
      });
    }

    await sendEmail({
      to: user.email,
      subject: "Orio Connect - Forget Password",
      html: getForgotPasswordTemplate("Employee", user.password_hash),
    });

    return res.status(200).json({
      status: 1,
      message: "Forgert password successfully",
      payload: [],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Auth
// Endpoint --> /api/v1/auth/fcm-token
// Description --> Create FCM Token
export const createFCMTokenHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = createFCMToken.parse(req.body);

    const user = await getUserByEmployeeId(parsedData.employee_id);
    if (!user) {
      return res.status(400).json({
        status: 0,
        message: "User associated with this employee does not exists",
        payload: [],
      });
    }

    const fcmToken = await createToken(parsedData, user.id);

    return res.status(200).json({
      status: 1,
      message: "FCM Token created successfully",
      payload: [fcmToken],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
