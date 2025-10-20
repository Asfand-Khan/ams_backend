import { Router } from "express";
import {
  createAssetComplaintHandler,
  getAllAssetComplaintHandler,
  getSingleAssetComplaintHandler,
  updateAssetComplaintHandler,
} from "../controllers/assetComplaintController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

router.post("/", createAssetComplaintHandler);
router.post("/all",authenticate, getAllAssetComplaintHandler);
router.post("/single", getSingleAssetComplaintHandler);
router.put("/", authenticate, updateAssetComplaintHandler);

export default router;
