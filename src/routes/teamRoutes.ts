import { Router } from "express";
import {
  createTeamHandler,
  getAllTeamsHandler,
  getSingleTeamHandler,
  updateTeamHandler,
} from "../controllers/teamController";

/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Operations related to teams in the organization
 */
const router = Router();

/**
 * @swagger
 * /teams:
 *   get:
 *     summary: Fetch all teams
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all teams
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.get("/", getAllTeamsHandler);

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Team'
 *     responses:
 *       201:
 *         description: Team created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       400:
 *         description: Team with this name already exists or validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.post("/", createTeamHandler);

/**
 * @swagger
 * /teams/single:
 *   post:
 *     summary: Fetch a single team by ID
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SingleTeamRequest'
 *     responses:
 *       200:
 *         description: Single team details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       404:
 *         description: Team not found
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal Server Error
 */
router.post("/single", getSingleTeamHandler);

/**
 * @swagger
 * /teams:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamUpdate'
 *     responses:
 *       200:
 *         description: Team updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeamResponse'
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */
router.put("/", updateTeamHandler);

export default router;
