import { Router } from "express";
import { getAllMenusHandler } from "../controllers/menuController";

/**
 * @swagger
 * tags:
 *   name: Menus
 *   description: Menu management for dynamic UI role-based access
 */

const router = Router();

// authenticate,

/**
 * @swagger
 * /menus/all:
 *   get:
 *     summary: Fetch all available menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Menus fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 1
 *                 message:
 *                   type: string
 *                   example: All menus fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Dashboard
 *                       icon:
 *                         type: string
 *                         example: dashboard
 *                       path:
 *                         type: string
 *                         example: /dashboard
 *                       parent_id:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 */
router.get("/all", getAllMenusHandler); // Get All Menus --> Protected

export default router;