import { Router } from "express";
import {
  createNotificationHandler,
  getAllNotificationsHandler,
  getSingleNotificationHandler,
} from "../controllers/notificationController";

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management module
 */

const router = Router();

/**
 * @swagger
 * /notifications/all:
 *   post:
 *     summary: Get all notifications for an employee
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 12
 *     responses:
 *       200:
 *         description: Notifications fetched successfully
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
 *                   example: Notifications fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 */
router.post("/all", getAllNotificationsHandler);

/**
 * @swagger
 * /notifications/add:
 *   post:
 *     summary: Create a new notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - type
 *               - priority
 *             properties:
 *               title:
 *                 type: string
 *                 example: "NEW SHIFT POLICY"
 *               message:
 *                 type: string
 *                 example: "there will be a new shift timing for all employees"
 *               type:
 *                 type: string
 *                 enum: [attendance, leave, shift, general, alert, holiday]
 *                 example: shift
 *               priority:
 *                 type: string
 *                 enum: [high, medium, low]
 *                 example: high
 *               user_id:
 *                 type: integer
 *                 nullable: true
 *                 example: 12
 *     responses:
 *       200:
 *         description: Notification created successfully
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
 *                   example: Notification created successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 */
router.post("/add", createNotificationHandler);

/**
 * @swagger
 * /notifications/single:
 *   post:
 *     summary: Get a single notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notification_id
 *             properties:
 *               notification_id:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Single notification fetched successfully
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
 *                   example: Single notification fetched successfully
 *                 payload:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Notification'
 */
router.post("/single", getSingleNotificationHandler);

export default router;
