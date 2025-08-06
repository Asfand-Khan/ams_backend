import { Router } from "express";
import { createAssetComplaintHandler, getAllAssetComplaintHandler, getSingleAssetComplaintHandler } from "../controllers/assetComplaintController";

const router = Router();

router.post("/", createAssetComplaintHandler);
router.post("/all", getAllAssetComplaintHandler);
router.post("/single", getSingleAssetComplaintHandler);

export default router;
