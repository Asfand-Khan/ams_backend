import { Router } from "express";
import {
  attendMeetingHandler,
  createMeetingHandler,
  dashboardMeetingListHandler,
  meetingInstanceListHandler,
  meetingInstanceStatusHandler,
  meetingListHandler,
  meetingMinutesHandler,
} from "../controllers/meetingController";

const router = Router();

router.get("/", dashboardMeetingListHandler);
router.post("/all", meetingListHandler);
router.post("/", createMeetingHandler);
router.post("/attend", attendMeetingHandler);
router.post("/instances", meetingInstanceListHandler);
router.post("/minutes", meetingMinutesHandler);
router.post("/instances/status", meetingInstanceStatusHandler);

export default router;