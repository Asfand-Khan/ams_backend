import { Router } from "express";
import {
  createWifiNetworkHandler,
  getAllWifiNetworksHandler,
} from "../controllers/officeWifiNetworkController";

const router = Router();

router.get("/all", getAllWifiNetworksHandler);
router.post("/", createWifiNetworkHandler);

export default router;
