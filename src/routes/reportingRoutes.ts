import { Router } from "express";
import { attendanceDetailHandler, overallAttendanceSummaryHandler } from "../controllers/reportingController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/overall-attendance-summary", authenticate, overallAttendanceSummaryHandler);
router.post("/attendance-detail",authenticate , attendanceDetailHandler);

export default router;