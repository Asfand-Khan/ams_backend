import { Router } from "express";
import { createEmployeeHandler } from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createEmployeeHandler);

export default router;