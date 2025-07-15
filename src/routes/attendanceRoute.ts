import { Router } from "express";
import { checkInHandler, checkOutHandler } from "../controllers/attendanceController";

const router = Router();

router.post("/check-in", checkInHandler);
router.post("/check-out", checkOutHandler);

export default router;