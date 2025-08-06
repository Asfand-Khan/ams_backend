import { Router } from "express";
import {
  createDesignationHandler,
  getAllDesignationsHandler,
  getSingleDesignationHandler,
  updateDesignationHandler,
} from "../controllers/designationController";

const router = Router();

router.get("/", getAllDesignationsHandler);
router.post("/", createDesignationHandler);
router.post("/single", getSingleDesignationHandler);
router.put("/", updateDesignationHandler);

export default router;