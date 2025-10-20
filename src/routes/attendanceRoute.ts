import { Router } from "express";
import {
  addAttendanceHandler,
  checkInHandler,
  checkOutHandler,
  getAttendanceByDateHandler,
  getAttendanceByIdHandler,
  getAttendanceHandler,
  getAttendanceSummaryHandler,
  getDailyAttendanceSummaryHandler,
  getSingleAttendanceHandler,
  updateAttendanceHandler,
} from "../controllers/attendanceController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", getAttendanceHandler);
router.post("/by-date", authenticate, getAttendanceByDateHandler);
router.post("/by-id", getAttendanceByIdHandler);
router.post("/add", addAttendanceHandler);
router.put("/update", updateAttendanceHandler);
router.post("/check-in", checkInHandler);
router.post("/check-out", checkOutHandler);
router.post("/single-attendance", getSingleAttendanceHandler);
router.post("/summary", getAttendanceSummaryHandler);
router.get("/daily-attendance-summary", authenticate, getDailyAttendanceSummaryHandler);

export default router;
