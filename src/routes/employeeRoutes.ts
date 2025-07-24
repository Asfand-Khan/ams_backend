import { Router } from "express";
import {
  changeEmployeePasswordHandler,
  createEmployeeHandler,
  getAllEmployeesHandler,
  getEmployeeProfileHandler,
  updateEmployeeProfileHandler,
} from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", getAllEmployeesHandler);
router.post("/", authenticate, createEmployeeHandler);
router.post("/change-password", changeEmployeePasswordHandler);
router.post("/profile", getEmployeeProfileHandler);
router.put("/update-profile", updateEmployeeProfileHandler);

export default router;
