import { Router } from "express";
import {
  addAttendanceHandler,
  checkInHandler,
  checkOutHandler,
  getAttendanceByDateHandler,
  getAttendanceByIdHandler,
  getAttendanceHandler,
  getAttendanceSummaryHandler,
  getSingleAttendanceHandler,
  updateAttendanceHandler,
} from "../controllers/attendanceController";

const router = Router();

router.post("/", getAttendanceHandler);
router.post("/by-date", getAttendanceByDateHandler);
router.post("/by-id", getAttendanceByIdHandler);
router.post("/add", addAttendanceHandler);
router.put("/update", updateAttendanceHandler);
router.post("/check-in", checkInHandler);
router.post("/check-out", checkOutHandler);
router.post("/single-attendance", getSingleAttendanceHandler);
router.post("/summary", getAttendanceSummaryHandler);

export default router;