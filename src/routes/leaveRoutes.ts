import { Router } from "express";
import {
  approveRejectLeaveHandler,
  createLeaveHandler,
  getAllLeavesHandler,
  getEmployeeLeaveDetailsHandler,
  getSingleLeaveHandler,
  leaveSummaryHandler,
} from "../controllers/leaveController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/all", authenticate,getAllLeavesHandler);
router.post("/", createLeaveHandler);
router.post("/single", getSingleLeaveHandler);
router.post("/summary", leaveSummaryHandler);
router.post("/getEmployeeLeaveDetail", getEmployeeLeaveDetailsHandler);
router.post("/approve-reject",authenticate, approveRejectLeaveHandler);

export default router;
