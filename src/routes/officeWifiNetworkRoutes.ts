import { Router } from "express";
import {
  createWifiNetworkHandler,
  getAllWifiNetworksHandler,
} from "../controllers/officeWifiNetworkController";

/**
 * @swagger
 * tags:
 *   name: Wifi Networks
 *   description: Manage office WiFi networks
 */

const router = Router();

/**
 * @swagger
 * /wifi-networks/all:
 *   get:
 *     summary: Fetch all WiFi networks
 *     tags: [Wifi Networks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: WiFi networks fetched successfully
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
 *                   example: Wifi networks fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WifiNetwork'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
router.get("/all", getAllWifiNetworksHandler);

/**
 * @swagger
 * /wifi-networks:
 *   post:
 *     summary: Create a new WiFi network
 *     tags: [Wifi Networks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/WifiNetworkCreateInput'
 *     responses:
 *       201:
 *         description: WiFi network created successfully
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
 *                   example: Wifi network created successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WifiNetwork'
 *       400:
 *         description: Validation error or bad input
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal Server Error
 */
router.post("/", createWifiNetworkHandler);

export default router;
