import { Router } from "express";
import { createEmployeeHandler } from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";
// import { authenticate, checkUserRights } from "../middleware/authMiddleware";

const router = Router();

// router.get("/", getAllDepartmentsHandler);
router.post("/", authenticate, createEmployeeHandler);
// router.get("/:id", getSingleDepartmentHandler);
// router.put("/", updateDepartmentHandler);

export default router;