import { Router } from "express";
import { createAssetComplaintHandler, getAllAssetComplaintHandler, getSingleAssetComplaintHandler } from "../controllers/assetComplaintController";

const router = Router();

/**
 * @swagger
 * /asset-complaints:
 *   post:
 *     summary: Create Asset Complaint
 *     tags:
 *       - Asset Complaints
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_id
 *               - request_type
 *               - category
 *               - asset_type
 *               - reason
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 example: 1
 *               request_type:
 *                 type: string
 *                 enum: [new, replacement, repair, return, issue, complaint]
 *                 example: complaint
 *               category:
 *                 type: string
 *                 enum: [hardware, software, network, office_facility, other]
 *                 example: software
 *               asset_type:
 *                 type: string
 *                 enum:
 *                   - laptop
 *                   - desktop
 *                   - mouse
 *                   - keyboard
 *                   - monitor
 *                   - printer
 *                   - scanner
 *                   - hard_drive
 *                   - charger
 *                   - projector
 *                   - software_installation
 *                   - software_error
 *                   - internet_issue
 *                   - vpn_issue
 *                   - email_issue
 *                   - power_issue
 *                   - desk
 *                   - chair
 *                   - AC
 *                   - light
 *                   - other
 *                 example: laptop
 *               reason:
 *                 type: string
 *                 example: Laptop is not turning on
 *     responses:
 *       201:
 *         description: Asset complaint created successfully
 */
router.post("/", createAssetComplaintHandler);

/**
 * @swagger
 * /asset-complaints/all:
 *   post:
 *     summary: Get all asset complaints for an employee
 *     tags:
 *       - Asset Complaints
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
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, rejected, resolved]
 *                 example: pending
 *     responses:
 *       200:
 *         description: Asset complaints fetched successfully
 */
router.post("/all", getAllAssetComplaintHandler);

/**
 * @swagger
 * /asset-complaints/single:
 *   post:
 *     summary: Get a single asset complaint by ID
 *     tags:
 *       - Asset Complaints
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - complaint_id
 *             properties:
 *               complaint_id:
 *                 type: integer
 *                 example: 1002
 *     responses:
 *       200:
 *         description: Asset complaint fetched successfully
 */
router.post("/single", getSingleAssetComplaintHandler);

export default router;
