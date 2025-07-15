"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
router.post("/login", authController_1.loginHandler);
router.post("/send-otp", authController_1.sendOtpHandler);
router.post("/verify-otp", authController_1.verifyOtpHandler);
exports.default = router;
