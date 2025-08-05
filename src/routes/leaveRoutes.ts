import { Router } from "express";
import {
  approveRejectLeaveHandler,
  createLeaveHandler,
  getAllLeavesHandler,
  getSingleLeaveHandler,
  leaveSummaryHandler,
} from "../controllers/leaveController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Leaves
 *   description: API endpoints for managing employee leaves
 */


/**
 * @swagger
 * /leaves/all:
 *   post:
 *     summary: Get all leave records
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-05"
 *     responses:
 *       200:
 *         description: All Leaves fetched successfully
 */
router.post("/all", getAllLeavesHandler);

/**
 * @swagger
 * /leaves:
 *   post:
 *     summary: Create a new leave application
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - leave_type_id
 *               - start_date
 *               - end_date
 *               - reason
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 example: 1
 *               leave_type_id:
 *                 type: integer
 *                 example: 2
 *               start_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-10"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-12"
 *               reason:
 *                 type: string
 *                 example: "Family function"
 *     responses:
 *       201:
 *         description: Leave created successfully
 */
router.post("/", createLeaveHandler);

/**
 * @swagger
 * /leaves/single:
 *   post:
 *     summary: Get details of a specific leave
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_id
 *             properties:
 *               leave_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Single Leave fetched successfully
 */
router.post("/single", getSingleLeaveHandler);

/**
 * @swagger
 * /leaves/summary:
 *   post:
 *     summary: Get leave summary of an employee
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Leave summary fetched successfully
 */
router.post("/summary", leaveSummaryHandler);

/**
 * @swagger
 * /leaves/approve-reject:
 *   post:
 *     summary: Approve or Reject a leave application
 *     tags: [Leaves]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_id
 *               - leave_type_id
 *               - employee_id
 *               - status
 *             properties:
 *               leave_id:
 *                 type: integer
 *                 example: 5
 *               leave_type_id:
 *                 type: integer
 *                 example: 2
 *               employee_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: "approved"
 *               remarks:
 *                 type: string
 *                 example: "Approved by HR"
 *     responses:
 *       200:
 *         description: Updated leave successfully
 */
router.post("/approve-reject", approveRejectLeaveHandler);

export default router;
