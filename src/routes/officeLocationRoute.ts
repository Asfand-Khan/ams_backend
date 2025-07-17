import { Router } from "express";
import {
  createDepartmentHandler,
  getAllDepartmentsHandler,
  getSingleDepartmentHandler,
  updateDepartmentHandler,
} from "../controllers/departmentController";
import { getAllOfficeLocationsHandler } from "../controllers/officeLocationController";
// import { authenticate, checkUserRights } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAllOfficeLocationsHandler);
// router.post("/", createDepartmentHandler);
// router.get("/:id", getSingleDepartmentHandler);
// router.put("/", updateDepartmentHandler);

export default router;