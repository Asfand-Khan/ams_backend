import { Router } from "express";
import { getAllWifiNetworksHandler } from "../controllers/officeWifiNetworkController";

const router = Router();

router.get("/all", getAllWifiNetworksHandler);

export default router;
