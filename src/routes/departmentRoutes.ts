import { Router } from "express";
import {
  createDepartmentHandler,
  getAllDepartmentsHandler,
  getSingleDepartmentHandler,
  updateDepartmentHandler,
} from "../controllers/departmentController";
// import { authenticate, checkUserRights } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAllDepartmentsHandler);
router.post("/", createDepartmentHandler);
router.get("/:id", getSingleDepartmentHandler);
router.put("/", updateDepartmentHandler);

export default router;