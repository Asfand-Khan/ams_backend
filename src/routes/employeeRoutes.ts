import { Router } from "express";
import {
  changeEmployeePasswordHandler,
  createEmployeeHandler,
  getEmployeeProfileHandler,
  updateEmployeeProfileHandler,
} from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createEmployeeHandler);
router.post("/change-password", changeEmployeePasswordHandler);
router.post("/profile", getEmployeeProfileHandler);
router.put("/update-profile", updateEmployeeProfileHandler);

export default router;
