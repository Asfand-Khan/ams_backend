import { Router } from "express";
import {
  createFCMTokenHandler,
  forgetPasswordHandler,
  loginHandler,
  sendOtpHandler,
  verifyOtpHandler,
} from "../controllers/authController";

const router = Router();

router.post("/login", loginHandler);
router.post("/send-otp", sendOtpHandler);
router.post("/verify-otp", verifyOtpHandler);
router.post("/forget-password", forgetPasswordHandler);
router.post("/fcm", createFCMTokenHandler);

export default router;