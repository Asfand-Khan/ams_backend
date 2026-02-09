import { Router } from "express";
import {
  createOfficeLocationHandler,
  getAllOfficeLocationsHandler,
  getSingleOfficeLocationHandler,
  updateOfficeLocationHandler,
} from "../controllers/officeLocationController";

const router = Router();

router.get("/", getAllOfficeLocationsHandler);
router.post("/", createOfficeLocationHandler);
router.put("/", updateOfficeLocationHandler);
router.post("/single", getSingleOfficeLocationHandler);

export default router;