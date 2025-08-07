import { Router } from "express";
import {
  createAssetComplaintHandler,
  getAllAssetComplaintHandler,
  getSingleAssetComplaintHandler,
  updateAssetComplaintHandler,
} from "../controllers/assetComplaintController";

const router = Router();

router.post("/", createAssetComplaintHandler);
router.post("/all", getAllAssetComplaintHandler);
router.post("/single", getSingleAssetComplaintHandler);
router.put("/", updateAssetComplaintHandler);

export default router;
