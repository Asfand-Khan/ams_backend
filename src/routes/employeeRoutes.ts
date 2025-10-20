import { Router } from "express";
import {
  changeEmployeePasswordHandler,
  createEmployeeHandler,
  getAllEmployeesHandler,
  getAllUsersHandler,
  getEmployeeProfileHandler,
  updateEmployeeProfileHandler,
} from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate,getAllEmployeesHandler);
router.post("/", authenticate, createEmployeeHandler);
router.post("/change-password", changeEmployeePasswordHandler);
router.post("/profile", getEmployeeProfileHandler);
router.put("/update-profile", updateEmployeeProfileHandler);
router.get("/users",authenticate, getAllUsersHandler);

export default router;
