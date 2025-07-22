import { Router } from "express";
import { getAllMenusHandler } from "../controllers/menuController";
const router = Router();

// authenticate,
router.get("/all", getAllMenusHandler); // Get All Menus --> Protected

export default router;