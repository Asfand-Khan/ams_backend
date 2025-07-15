"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyOtpHandler = exports.sendOtpHandler = exports.loginHandler = void 0;
const authValidations_1 = require("../validations/authValidations");
const authServices_1 = require("../services/authServices");
const sendEmail_1 = require("../utils/sendEmail");
const authHelpers_1 = require("../utils/authHelpers");
// Module --> Auth
// Endpoint --> /api/v1/auth/login
// Description --> Authenticate Employee
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = authValidations_1.loginSchema.parse(req.body);
        const userByUsername = yield (0, authServices_1.getUserByUsername)(parsedData.username);
        if (!userByUsername) {
            return res.status(400).json({
                status: 0,
                message: "Invalid username or password",
                payload: [],
            });
        }
        const isPasswordValid = (0, authServices_1.comparePassword)(parsedData.password, userByUsername.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({
                status: 0,
                message: "Invalid username or password",
                payload: [],
            });
        }
        yield (0, authServices_1.generateOTP)(userByUsername.username);
        return res.status(200).json({
            status: 1,
            message: "Login successfully",
            payload: [{ username: userByUsername.username }],
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message,
            payload: [],
        });
    }
});
exports.loginHandler = loginHandler;
// Module --> Auth
// Endpoint --> /api/v1/auth/send-otp
// Description --> Send OTP to Employee
const sendOtpHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = authValidations_1.sendOtpSchema.parse(req.body);
        const userByUsername = yield (0, authServices_1.getUserByUsername)(parsedData.username);
        if (!userByUsername) {
            return res.status(400).json({
                status: 0,
                message: "Invalid username or password",
                payload: [],
            });
        }
        yield (0, sendEmail_1.sendEmail)({
            to: userByUsername.email,
            subject: "Orio Attendance - OTP for login",
            text: "Your OTP is " + userByUsername.otp_token,
        });
        return res.status(200).json({
            status: 1,
            message: "OTP sent successfully",
            payload: [],
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message,
            payload: [],
        });
    }
});
exports.sendOtpHandler = sendOtpHandler;
// Module --> Auth
// Endpoint --> /api/v1/auth/verify-otp
// Description --> Verify OTP to Employee
const verifyOtpHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const parsedData = authValidations_1.verifyOtpSchema.parse(req.body);
        const userByUsername = yield (0, authServices_1.getUserByUsername)(parsedData.username);
        if (!userByUsername) {
            return res.status(400).json({
                status: 0,
                message: "Invalid OTP",
                payload: [],
            });
        }
        const isValidOtp = yield (0, authServices_1.verifyOTP)(parsedData.otp, Number(userByUsername.otp_token), parsedData.username);
        if (!isValidOtp) {
            return res.status(400).json({
                status: 0,
                message: "Invalid OTP",
                payload: [],
            });
        }
        // Generate token
        const token = (0, authHelpers_1.generateToken)(((_a = userByUsername.employee) === null || _a === void 0 ? void 0 : _a.id) || 0);
        return res.status(200).json({
            status: 1,
            message: "OTP verified successfully",
            payload: [
                {
                    username: userByUsername.username,
                    user_id: userByUsername.id,
                    employee_id: (_b = userByUsername.employee) === null || _b === void 0 ? void 0 : _b.id,
                    employee_code: (_c = userByUsername.employee) === null || _c === void 0 ? void 0 : _c.employee_code,
                    token,
                },
            ],
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message,
            payload: [],
        });
    }
});
exports.verifyOtpHandler = verifyOtpHandler;
