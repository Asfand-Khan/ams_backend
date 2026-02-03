import { Router } from "express";

import { authenticate } from "../middlewares/authMiddleware";
import {
  assignAssetHandler,
  createAssetHandler,
  getAllAssetsHandler,
  getAssetByIdHandler,
  getAssetHistoryHandler,
  getEmployeeAssetsHandler,
  returnAssetHandler,
  updateAssetHandler,
} from "../controllers/assetController";

const router = Router();

router.post("", authenticate, createAssetHandler);
router.put("/:id", authenticate, updateAssetHandler);
router.post("/assign", authenticate, assignAssetHandler);
router.post("/return", authenticate, returnAssetHandler);
router.post("/list", authenticate, getAllAssetsHandler);
router.get("/:id/history", authenticate, getAssetHistoryHandler);
router.get("/:id", authenticate, getAssetByIdHandler);
router.get(
  "/:employeeId/assets",
  authenticate,
  getEmployeeAssetsHandler,
);
export default router;
