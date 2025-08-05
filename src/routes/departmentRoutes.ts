import { Router } from "express";
import {
  createDepartmentHandler,
  getAllDepartmentsHandler,
  getSingleDepartmentHandler,
  updateDepartmentHandler,
} from "../controllers/departmentController";

const router = Router();

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all department records
 *     tags:
 *       - Department
 *     responses:
 *       200:
 *         description: Departments fetched successfully
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
 *                   example: Departments fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Department object
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllDepartmentsHandler);


/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags:
 *       - Department
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Department name (1–100 characters)
 *                 example: hr
 *               description:
 *                 type: string
 *                 description: Department description
 *                 example: handles all hr activities
 *     responses:
 *       201:
 *         description: Department created successfully
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
 *                   example: Department created successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Created Department object
 *       400:
 *         description: Bad Request (e.g., duplicate name or validation error)
 */
router.post("/", createDepartmentHandler);


/**
 * @swagger
 * /departments/single:
 *   post:
 *     summary: Retrieve a single department by ID
 *     tags:
 *       - Department
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
 *                 minimum: 1
 *                 description: Department ID to fetch
 *                 example: 5
 *     responses:
 *       200:
 *         description: Single department retrieved successfully
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
 *                   example: Fetched single department successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Department object
 *       400:
 *         description: Invalid department ID
 *       404:
 *         description: Department not found
 */
router.post("/single", getSingleDepartmentHandler);


/**
 * @swagger
 * /departments:
 *   put:
 *     summary: Update an existing department
 *     tags:
 *       - Department
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dept_id
 *               - name
 *             properties:
 *               dept_id:
 *                 type: integer
 *                 description: Department ID to update
 *                 example: 3
 *               name:
 *                 type: string
 *                 description: Updated department name
 *                 example: finance
 *               description:
 *                 type: string
 *                 description: Updated description
 *                 example: manages all finance activities
 *     responses:
 *       200:
 *         description: Department updated successfully
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
 *                   example: Department updated successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Updated Department object
 *       400:
 *         description: Validation error
 *       404:
 *         description: Department not found
 */
router.put("/", updateDepartmentHandler);

export default router;
