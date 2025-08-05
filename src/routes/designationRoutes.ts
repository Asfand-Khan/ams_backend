import { Router } from "express";
import {
  createDesignationHandler,
  getAllDesignationsHandler,
  getSingleDesignationHandler,
  updateDesignationHandler,
} from "../controllers/designationController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Designations
 *   description: API for managing employee designations
 */

/**
 * @swagger
 * /designations:
 *   get:
 *     summary: Get all designations
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched all designations
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
 *                   example: Designations fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Designation'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", getAllDesignationsHandler);

/**
 * @swagger
 * /designations:
 *   post:
 *     summary: Create a new designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DesignationInput'
 *     responses:
 *       201:
 *         description: Designation created successfully
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
 *                   example: Designation created successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Designation'
 *       400:
 *         description: Bad request or title already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/", createDesignationHandler);

/**
 * @swagger
 * /designations/single:
 *   post:
 *     summary: Get a single designation by ID
 *     tags: [Designations]
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
 *         description: Successfully fetched designation
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
 *                   example: Fetched single designation successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Designation'
 *       400:
 *         description: Invalid ID or ID is missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/single", getSingleDesignationHandler);

/**
 * @swagger
 * /designations:
 *   put:
 *     summary: Update a designation
 *     tags: [Designations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DesignationUpdate'
 *     responses:
 *       200:
 *         description: Designation updated successfully
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
 *                   example: Designation updated successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Designation'
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put("/", updateDesignationHandler);

export default router;
