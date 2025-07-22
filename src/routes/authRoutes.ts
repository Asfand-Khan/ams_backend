import { Router } from "express";
import { forgetPasswordHandler, loginHandler, sendOtpHandler, verifyOtpHandler } from "../controllers/authController";

const router = Router();

router.post("/login", loginHandler);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/forget-password", forgetPasswordHandler);

export default router;