import { Router } from "express";
import {
  createOfficeLocationHandler,
  getAllOfficeLocationsHandler,
} from "../controllers/officeLocationController";

/**
 * @swagger
 * tags:
 *   name: Office Locations
 *   description: Manage office locations
 */

const router = Router();

/**
 * @swagger
 * /office-locations:
 *   get:
 *     summary: Fetch all office locations
 *     tags: [Office Locations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Office locations fetched successfully
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
 *                   example: Office locations fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OfficeLocation'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Server error
 */
router.get("/", getAllOfficeLocationsHandler);

/**
 * @swagger
 * /office-locations:
 *   post:
 *     summary: Create a new office location
 *     tags: [Office Locations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OfficeLocationInput'
 *     responses:
 *       201:
 *         description: Office location created successfully
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
 *                   example: Office locations created successfully
 *                 payload:
 *                   $ref: '#/components/schemas/OfficeLocation'
 *       400:
 *         description: Bad Request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: Office location with this name already exists
 *                 payload:
 *                   type: array
 *                   items: {}
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal Server Error
 */
router.post("/", createOfficeLocationHandler);

export default router;
