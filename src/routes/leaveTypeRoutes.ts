import { Router } from 'express';
import * as controller from '../controllers/leaveTypeController';

/**
 * @swagger
 * tags:
 *   name: LeaveTypes
 *   description: Manage leave type definitions used in the leave system
 */

const router = Router();

/**
 * @swagger
 * /leave-types:
 *   get:
 *     summary: Fetch all leave types
 *     tags: [LeaveTypes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of leave types fetched successfully
 */
router.get('/', controller.getAll);

/**
 * @swagger
 * /leave-types/single:
 *   post:
 *     summary: Fetch a single leave type by ID
 *     tags: [LeaveTypes]
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
 *                 example: 2
 *     responses:
 *       200:
 *         description: Single leave type fetched successfully
 */
router.post('/single', controller.single);

/**
 * @swagger
 * /leave-types:
 *   post:
 *     summary: Create a new leave type
 *     tags: [LeaveTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - total_quota
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sick Leave"
 *               total_quota:
 *                 type: number
 *                 example: 12
 *     responses:
 *       201:
 *         description: Leave type created successfully
 */
router.post('/', controller.create);

/**
 * @swagger
 * /leave-types:
 *   put:
 *     summary: Update an existing leave type
 *     tags: [LeaveTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - leave_type_id
 *               - name
 *               - total_quota
 *             properties:
 *               leave_type_id:
 *                 type: integer
 *                 example: 3
 *               name:
 *                 type: string
 *                 example: "Updated Sick Leave"
 *               total_quota:
 *                 type: number
 *                 example: 14
 *     responses:
 *       200:
 *         description: Leave type updated successfully
 */
router.put('/', controller.update);

/**
 * @swagger
 * /leave-types/{id}:
 *   delete:
 *     summary: Delete a leave type by ID
 *     tags: [LeaveTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 4
 *     responses:
 *       200:
 *         description: Leave type deleted successfully
 */
router.delete('/:id', controller.remove);

export default router;