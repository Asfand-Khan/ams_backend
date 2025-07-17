import { Router } from "express";
import {
  createAttendanceCorrectionHandler,
  getAllAttendanceCorrectionHandler,
  getSingleAttendanceCorrectionHandler,
} from "../controllers/attendanceCorrectionController";

const router = Router();

router.post("/", createAttendanceCorrectionHandler);
router.post("/all", getAllAttendanceCorrectionHandler);
router.post("/single", getSingleAttendanceCorrectionHandler);

export default router;
