import { Router } from "express";
import {
  addCommentHandler,
  addProjectStatusHandler,
  createProjectHandler,
  projectsListHandler,
  getAllProjectsHandler,
  getCommentListHandler,
  getProjectEmployeesHandler,
  removeProjectStatusHandler,
  updateProjectAssigneesHandler,
  updateProjectHandler,
} from "../controllers/projectController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", authenticate, createProjectHandler);
router.put("/:id", authenticate, updateProjectHandler);
router.post("/:projectId/comments", authenticate, addCommentHandler);
router.get("/list", authenticate, projectsListHandler);
router.get("", authenticate, getAllProjectsHandler);
router.get("/:projectId/comments", authenticate, getCommentListHandler);
router.post("/:projectId/assign", authenticate, updateProjectAssigneesHandler);
router.post("/:projectId/statuses", authenticate, addProjectStatusHandler);
router.get("/projectuserlist", authenticate, getProjectEmployeesHandler);
router.delete(
  "/:projectId/statuses/:statusId",
  authenticate,
  removeProjectStatusHandler,
);

export default router;
