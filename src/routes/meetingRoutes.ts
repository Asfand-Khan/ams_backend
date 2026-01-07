import { Router } from "express";
import {
  attendMeetingHandler,
  createMeetingHandler,
  dashboardMeetingListHandler,
  getMeetingByIdHandler,
  meetingInstanceListHandler,
  meetingInstanceStatusHandler,
  meetingListHandler,
  meetingMinutesHandler,
  updateMeetingHandler,
} from "../controllers/meetingController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate, dashboardMeetingListHandler);
// Specific routes first to avoid catching by /:id
router.post("/all", meetingListHandler);
router.post("/", createMeetingHandler);
router.post("/attend", attendMeetingHandler);
// router.post below is "instances"
router.post("/instances", meetingInstanceListHandler);
router.post("/minutes", authenticate, meetingMinutesHandler);
router.post("/instances/status", meetingInstanceStatusHandler);

// Dynamic routes last
router.get("/:id", authenticate, getMeetingByIdHandler);
router.put("/:id", authenticate, updateMeetingHandler);

export default router;
