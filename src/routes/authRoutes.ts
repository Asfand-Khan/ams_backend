import { Router } from "express";
import { createFCMTokenHandler, forgetPasswordHandler, loginHandler, sendOtpHandler, verifyOtpHandler } from "../controllers/authController";

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Authenticate Employee
 *     description: Authenticates the employee by validating username and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: securePassword123
 *     responses:
 *       200:
 *         description: Login successfully
 *       400:
 *         description: Invalid username or password
 */
router.post("/login", loginHandler);

/**
 * @swagger
 * /auth/send-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Send OTP to Employee
 *     description: Sends OTP to employee's email for verification after login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid username
 */
router.post("/send-otp", sendOtpHandler);

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Verify OTP
 *     description: Verifies the OTP provided by the employee.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - otp
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               otp:
 *                 type: number
 *                 example: 123456
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */
router.post("/verify-otp", verifyOtpHandler);

/**
 * @swagger
 * /auth/forget-password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Forget Password
 *     description: Sends the user's password to their registered email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_email
 *             properties:
 *               employee_email:
 *                 type: string
 *                 format: email
 *                 example: employee@example.com
 *     responses:
 *       200:
 *         description: Password sent successfully
 *       400:
 *         description: User not found
 */
router.post("/forget-password", forgetPasswordHandler);

/**
 * @swagger
 * /auth/fcm:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Create FCM Token
 *     description: Stores the Firebase Cloud Messaging token for push notifications.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - token
 *             properties:
 *               employee_id:
 *                 type: number
 *                 example: 101
 *               token:
 *                 type: string
 *                 example: abc123xyz_fcm_token
 *     responses:
 *       200:
 *         description: FCM Token created successfully
 *       400:
 *         description: Employee not found
 */
router.post("/fcm", createFCMTokenHandler);

export default router;