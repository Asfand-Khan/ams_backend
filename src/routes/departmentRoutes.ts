import { Router } from "express";
import {
  createDepartmentHandler,
  getAllDepartmentsHandler,
  getSingleDepartmentHandler,
  updateDepartmentHandler,
} from "../controllers/departmentController";

const router = Router();

router.get("/", getAllDepartmentsHandler);
router.post("/", createDepartmentHandler);
router.post("/single", getSingleDepartmentHandler);
router.put("/", updateDepartmentHandler);

export default router;