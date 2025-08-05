import { Router } from "express";
import {
  createShiftHandler,
  getAllShiftsHandler,
  getSingleShiftHandler,
  updateShiftHandler,
} from "../controllers/shiftController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Manage office shifts
 */

/**
 * @swagger
 * /shifts:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all shifts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllShiftsHandler);

/**
 * @swagger
 * /shifts:
 *   post:
 *     summary: Create a new shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Shift'
 *     responses:
 *       201:
 *         description: Shift created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftResponse'
 *       400:
 *         description: Bad request (e.g., shift already exists)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", createShiftHandler);

/**
 * @swagger
 * /shifts/single:
 *   post:
 *     summary: Get a single shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShiftSingleRequest'
 *     responses:
 *       200:
 *         description: Fetched single shift successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftResponse'
 *       400:
 *         description: Invalid shift ID
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/single", getSingleShiftHandler);

/**
 * @swagger
 * /shifts:
 *   put:
 *     summary: Update an existing shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ShiftWithId'
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ShiftResponse'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put("/", updateShiftHandler);

export default router;
