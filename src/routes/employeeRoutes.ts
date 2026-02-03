import { Router } from "express";
import {
  changeEmployeePasswordHandler,
  createEmployeeHandler,
  getAllEmployeesHandler,
  getAllUsersHandler,
  getEmployeeDocumentsHandler,
  getEmployeeProfileHandler,
  getSingleEmployeeFullHandler,
  updateEmployeeDocumentHandler,
  updateEmployeeHandler,
  updateEmployeeProfileHandler,
  updateEmployeeStatusHandler,
  uploadEmployeeDocumentsHandler,
} from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/", authenticate,getAllEmployeesHandler);
router.post("/", authenticate, createEmployeeHandler);
router.post("/change-password", changeEmployeePasswordHandler);
router.post("/profile", getEmployeeProfileHandler);
router.put("/update-profile", updateEmployeeProfileHandler);
router.get("/users",authenticate, getAllUsersHandler);
router.put("/:id", authenticate,updateEmployeeHandler);
router.put("/:id/status", authenticate,updateEmployeeStatusHandler);
router.get("/:id/full", authenticate, getSingleEmployeeFullHandler);
router.post("/documents", authenticate, uploadEmployeeDocumentsHandler);
router.put("/documents/:id", authenticate, updateEmployeeDocumentHandler);
router.get("/:employeeId/documents", authenticate, getEmployeeDocumentsHandler);
export default router;
