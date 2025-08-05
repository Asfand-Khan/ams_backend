import { Router } from "express";
import {
  createHolidayHandler,
  getAllHolidaysHandler,
  getSingleHolidayHandler,
  updateHolidayHandler,
} from "../controllers/holidayController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Holidays
 *   description: API endpoints for managing holidays
 */

/**
 * @swagger
 * /holidays:
 *   get:
 *     summary: Get all holidays
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all holidays
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
 *                   example: All holidays fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       holiday_id:
 *                         type: integer
 *                       holiday_date:
 *                         type: string
 *                         format: date
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 */
router.get("/", getAllHolidaysHandler);

/**
 * @swagger
 * /holidays:
 *   post:
 *     summary: Create a new holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - holiday_date
 *               - title
 *             properties:
 *               holiday_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-25"
 *               title:
 *                 type: string
 *                 example: "Christmas"
 *               description:
 *                 type: string
 *                 example: "Public holiday for Christmas"
 *     responses:
 *       201:
 *         description: Holiday created successfully
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
 *                   example: Holiday created successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Holiday'
 */
router.post("/", createHolidayHandler);

/**
 * @swagger
 * /holidays/single:
 *   post:
 *     summary: Get a single holiday by ID
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Holiday fetched successfully
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
 *                   example: Single holiday fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Holiday'
 */
router.post("/single", getSingleHolidayHandler);

/**
 * @swagger
 * /holidays:
 *   put:
 *     summary: Update a holiday
 *     tags: [Holidays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - holiday_id
 *               - holiday_date
 *               - title
 *             properties:
 *               holiday_id:
 *                 type: integer
 *                 example: 1
 *               holiday_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-12-31"
 *               title:
 *                 type: string
 *                 example: "New Year's Eve"
 *               description:
 *                 type: string
 *                 example: "Updated description"
 *     responses:
 *       200:
 *         description: Holiday updated successfully
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
 *                   example: Holiday updated successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Holiday'
 */
router.put("/", updateHolidayHandler);

export default router
