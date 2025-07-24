import { Router } from "express";
import { createNotificationHandler, getAllNotificationsHandler, getSingleNotificationHandler } from "../controllers/notificationController";

const router = Router();

router.post("/all", getAllNotificationsHandler);
router.post("/add", createNotificationHandler);
router.post("/single", getSingleNotificationHandler);

export default router;
