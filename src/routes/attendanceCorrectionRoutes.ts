import { Router } from "express";
import {
  approveRejectAttendanceCorrectionHandler,
  createAttendanceCorrectionHandler,
  getAllAttendanceCorrectionHandler,
  getSingleAttendanceCorrectionHandler,
} from "../controllers/attendanceCorrectionController";

const router = Router();

router.post("/", createAttendanceCorrectionHandler);
router.post("/all", getAllAttendanceCorrectionHandler);
router.post("/single", getSingleAttendanceCorrectionHandler);
router.post("/approve-reject", approveRejectAttendanceCorrectionHandler);

export default router;
