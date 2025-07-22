import { Router } from "express";
import { changeEmployeePasswordHandler, createEmployeeHandler, getEmployeeProfileHandler } from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createEmployeeHandler);
router.post("/change-password", changeEmployeePasswordHandler);
router.post("/profile", getEmployeeProfileHandler);

export default router;