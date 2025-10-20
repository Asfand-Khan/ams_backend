import { Router } from "express";
import {
  createTeamHandler,
  getAllTeamsHandler,
  getSingleTeamHandler,
  updateTeamHandler,
} from "../controllers/teamController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.get("/",authenticate, getAllTeamsHandler);
router.post("/", createTeamHandler);
router.post("/single", getSingleTeamHandler);
router.put("/", updateTeamHandler);

export default router;
