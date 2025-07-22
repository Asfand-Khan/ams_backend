import { Router } from "express";
import { createNotificationHandler } from "../controllers/notificationController";

const router = Router();

router.post("/add", createNotificationHandler);

export default router;
