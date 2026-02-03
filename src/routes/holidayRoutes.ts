import { Router } from "express";
import {
  createHolidayHandler,
  getAllHolidaysHandler,
  getHolidayByIdHandler,
  updateHolidayHandler,
} from "../controllers/holidayController";

const router = Router();

router.get("/", getAllHolidaysHandler);
router.post("/", createHolidayHandler);
router.post("/single", getHolidayByIdHandler);
router.put("/:id", updateHolidayHandler);

export default router
