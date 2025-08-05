import { Router } from "express";
import {
  addAttendanceHandler,
  checkInHandler,
  checkOutHandler,
  getAttendanceByDateHandler,
  getAttendanceByIdHandler,
  getAttendanceHandler,
  getAttendanceSummaryHandler,
  getSingleAttendanceHandler,
  updateAttendanceHandler,
} from "../controllers/attendanceController";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Employee attendance management
 */


/**
 * @swagger
 * /attendances:
 *   post:
 *     summary: Fetch attendance for an employee between date range
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - start_date
 *               - end_date
 *             properties:
 *               employee_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Attendance fetched successfully
 */
router.post("/", getAttendanceHandler);

/**
 * @swagger
 * /attendances/by-date:
 *   post:
 *     summary: Fetch attendance by specific date
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendance_date:
 *                 type: string
 *                 format: date
 *             required:
 *               - attendance_date
 *     responses:
 *       200:
 *         description: Attendance for date fetched
 */
router.post("/by-date", getAttendanceByDateHandler);

/**
 * @swagger
 * /attendances/by-id:
 *   post:
 *     summary: Fetch attendance by ID
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attendance_id:
 *                 type: integer
 *             required:
 *               - attendance_id
 *     responses:
 *       200:
 *         description: Attendance fetched by ID
 */
router.post("/by-id", getAttendanceByIdHandler);

/**
 * @swagger
 * /attendances/add:
 *   post:
 *     summary: Add a new attendance record
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, attendance_date]
 *             properties:
 *               employee_id:
 *                 type: integer
 *               attendance_date:
 *                 type: string
 *               check_in_time:
 *                 type: string
 *                 nullable: true
 *               check_out_time:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Attendance added
 */
router.post("/add", addAttendanceHandler);

/**
 * @swagger
 * /attendances/update:
 *   put:
 *     summary: Update existing attendance
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [attendance_id, attendance_date]
 *             properties:
 *               attendance_id:
 *                 type: integer
 *               attendance_date:
 *                 type: string
 *               check_in_time:
 *                 type: string
 *                 nullable: true
 *               check_out_time:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Attendance updated
 */
router.put("/update", updateAttendanceHandler);

/**
 * @swagger
 * /attendances/check-in:
 *   post:
 *     summary: Check-in for an employee
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, attendance_date, check_in_time, check_in_office_location]
 *             properties:
 *               employee_id:
 *                 type: integer
 *               attendance_date:
 *                 type: string
 *                 format: date
 *               check_in_time:
 *                 type: string
 *               check_in_office_location:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Employee checked in
 */
router.post("/check-in", checkInHandler);

/**
 * @swagger
 * /attendances/check-out:
 *   post:
 *     summary: Check-out for an employee
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, attendance_date, check_out_time, check_out_office_location]
 *             properties:
 *               employee_id:
 *                 type: integer
 *               attendance_date:
 *                 type: string
 *                 format: date
 *               check_out_time:
 *                 type: string
 *               check_out_office_location:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Employee checked out
 */
router.post("/check-out", checkOutHandler);

/**
 * @swagger
 * /attendances/single-attendance:
 *   post:
 *     summary: Get single attendance record
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, attendance_date]
 *             properties:
 *               employee_id:
 *                 type: integer
 *               attendance_date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Single attendance fetched
 */
router.post("/single-attendance", getSingleAttendanceHandler);

/**
 * @swagger
 * /attendances/summary:
 *   post:
 *     summary: Get attendance summary
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employee_id, start_date, end_date]
 *             properties:
 *               employee_id:
 *                 type: integer
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Attendance summary returned
 */
router.post("/summary", getAttendanceSummaryHandler);

export default router;