"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attendanceController_1 = require("../controllers/attendanceController");
const router = (0, express_1.Router)();
router.post("/check-in", attendanceController_1.checkInHandler);
router.post("/check-out", attendanceController_1.checkOutHandler);
exports.default = router;
