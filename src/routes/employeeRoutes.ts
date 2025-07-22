import { Router } from "express";
import { changeEmployeePasswordHandler, createEmployeeHandler } from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createEmployeeHandler);
router.post("/change-password", changeEmployeePasswordHandler);

export default router;