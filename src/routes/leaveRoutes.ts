import { Router } from "express";
import {
  approveRejectLeaveHandler,
  createLeaveHandler,
  getAllLeavesHandler,
  getSingleLeaveHandler,
  leaveSummaryHandler,
} from "../controllers/leaveController";

const router = Router();

router.post("/all", getAllLeavesHandler);
router.post("/", createLeaveHandler);
router.post("/single", getSingleLeaveHandler);
router.post("/summary", leaveSummaryHandler);
router.post("/approve-reject", approveRejectLeaveHandler);

export default router;
