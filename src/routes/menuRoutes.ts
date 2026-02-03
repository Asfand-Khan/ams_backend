import { Router } from "express";
import {
  createMenuHandler,
  getAllMenusHandler,
  getSingleMenuHandler,
  updateMenuHandler,
  updateMenuSortingHandler,
} from "../controllers/menuController";
import { authenticate } from "../middlewares/authMiddleware";
const router = Router();

// authenticate,
router.get("/all", getAllMenusHandler); // Get All Menus --> Protected
router.get("/:id", getSingleMenuHandler);
router.post("/", authenticate, createMenuHandler);
router.put("/:id", authenticate, updateMenuHandler);
router.post("/sort", authenticate, updateMenuSortingHandler);
export default router;
