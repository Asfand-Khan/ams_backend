import { Router } from "express";
import {
  createShiftHandler,
  getAllShiftsHandler,
  getSingleShiftHandler,
  updateShiftHandler,
} from "../controllers/shiftController";

const router = Router();

router.get("/", getAllShiftsHandler);
router.post("/", createShiftHandler);
router.post("/single", getSingleShiftHandler);
router.put("/", updateShiftHandler);

export default router;
