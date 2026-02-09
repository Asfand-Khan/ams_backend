import { Router } from "express";
import {
  createWifiNetworkHandler,
  getAllWifiNetworksHandler,
  getSingleWifiNetworkHandler,
  updateWifiNetworkHandler,
} from "../controllers/officeWifiNetworkController";

const router = Router();

router.get("/all", getAllWifiNetworksHandler);
router.post("/", createWifiNetworkHandler);
router.put("/", updateWifiNetworkHandler);
router.post("/single", getSingleWifiNetworkHandler);

export default router;