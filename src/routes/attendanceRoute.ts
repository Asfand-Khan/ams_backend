import { Router } from "express";
import { checkInHandler, checkOutHandler, getAttendanceSummaryHandler, getSingleAttendanceHandler } from "../controllers/attendanceController";

const router = Router();

router.post("/check-in", checkInHandler);
router.post("/check-out", checkOutHandler);
router.post("/single-attendance", getSingleAttendanceHandler);
router.post("/summary", getAttendanceSummaryHandler);

export default router;