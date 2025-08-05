import { Router } from "express";
import {
  approveRejectAttendanceCorrectionHandler,
  createAttendanceCorrectionHandler,
  getAllAttendanceCorrectionHandler,
  getSingleAttendanceCorrectionHandler,
} from "../controllers/attendanceCorrectionController";

const router = Router();

/**
 * @swagger
 * /attendance-correction:
 *   post:
 *     summary: Create Attendance Correction
 *     tags:
 *       - Attendance Correction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - attendance_date
 *               - request_type
 *               - reason
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 example: 101
 *               attendance_date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *               request_type:
 *                 type: string
 *                 enum: [missed_check_in, missed_check_out, wrong_time, both]
 *                 example: missed_check_in
 *               requested_check_in_time:
 *                 type: string
 *                 format: time
 *                 example: "09:15:00"
 *               requested_check_out_time:
 *                 type: string
 *                 format: time
 *                 example: "18:00:00"
 *               reason:
 *                 type: string
 *                 example: "Missed check-in due to network outage"
 *     responses:
 *       201:
 *         description: Attendance correction created successfully
 */
router.post("/", createAttendanceCorrectionHandler);

/**
 * @swagger
 * /attendance-correction/all:
 *   post:
 *     summary: Get all attendance corrections
 *     tags:
 *       - Attendance Correction
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 example: 101
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 example: pending
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *     responses:
 *       200:
 *         description: Attendance corrections fetched successfully
 */
router.post("/all", getAllAttendanceCorrectionHandler);

/**
 * @swagger
 * /attendance-correction/single:
 *   post:
 *     summary: Get single attendance correction
 *     tags:
 *       - Attendance Correction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendance_correction_id
 *             properties:
 *               attendance_correction_id:
 *                 type: integer
 *                 example: 1002
 *     responses:
 *       200:
 *         description: Attendance correction details fetched
 */
router.post("/single", getSingleAttendanceCorrectionHandler);

/**
 * @swagger
 * /attendance-correction/approve-reject:
 *   post:
 *     summary: Approve or Reject Attendance Correction
 *     tags:
 *       - Attendance Correction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - attendance_correction_id
 *               - employee_id
 *               - status
 *             properties:
 *               attendance_correction_id:
 *                 type: integer
 *                 example: 1002
 *               employee_id:
 *                 type: integer
 *                 example: 101
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 example: approved
 *               remarks:
 *                 type: string
 *                 example: "Verified and approved"
 *     responses:
 *       200:
 *         description: Attendance correction updated
 */
router.post("/approve-reject", approveRejectAttendanceCorrectionHandler);

export default router;
