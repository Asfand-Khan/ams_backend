import { Router } from "express";
import {
  createHolidayHandler,
  getAllHolidaysHandler,
  getSingleHolidayHandler,
  updateHolidayHandler,
} from "../controllers/holidayController";

const router = Router();

router.get("/", getAllHolidaysHandler);
router.post("/", createHolidayHandler);
router.post("/single", getSingleHolidayHandler);
router.put("/", updateHolidayHandler);

export default router;
