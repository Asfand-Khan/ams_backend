import { Router } from "express";
import {
  approveRejectAttendanceCorrectionHandler,
  createAttendanceCorrectionHandler,
  getAllAttendanceCorrectionHandler,
  getSingleAttendanceCorrectionHandler,
} from "../controllers/attendanceCorrectionController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", createAttendanceCorrectionHandler);
router.post("/all", authenticate,getAllAttendanceCorrectionHandler);
router.post("/single", getSingleAttendanceCorrectionHandler);
router.post("/approve-reject", authenticate , approveRejectAttendanceCorrectionHandler);

export default router;
