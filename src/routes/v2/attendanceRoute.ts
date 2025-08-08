import { Router } from "express";
import { getAttendanceSummaryV2Handler } from "../../controllers/attendanceController";

const router = Router();

router.post("/summary", getAttendanceSummaryV2Handler);

export default router;