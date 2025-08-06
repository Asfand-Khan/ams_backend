import { Router } from "express";
import {
  createTeamHandler,
  getAllTeamsHandler,
  getSingleTeamHandler,
  updateTeamHandler,
} from "../controllers/teamController";

const router = Router();

router.get("/", getAllTeamsHandler);
router.post("/", createTeamHandler);
router.post("/single", getSingleTeamHandler);
router.put("/", updateTeamHandler);

export default router;
