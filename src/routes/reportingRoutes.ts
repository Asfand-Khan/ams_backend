import { Router } from "express";
import { attendanceDetailHandler, overallAttendanceSummaryHandler } from "../controllers/reportingController";

const router = Router();

router.post("/overall-attendance-summary", overallAttendanceSummaryHandler);
router.post("/attendance-detail", attendanceDetailHandler);

export default router;