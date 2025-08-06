import { Router } from "express";
import {
  createOfficeLocationHandler,
  getAllOfficeLocationsHandler,
} from "../controllers/officeLocationController";

const router = Router();

router.get("/", getAllOfficeLocationsHandler);
router.post("/", createOfficeLocationHandler);

export default router;
