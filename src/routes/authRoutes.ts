import { Router } from "express";
import { loginHandler, sendOtpHandler, verifyOtpHandler } from "../controllers/authController";

const router = Router();

router.post("/login", loginHandler);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);

export default router;