import { Router } from "express";
import {
  changeEmployeePasswordHandler,
  createEmployeeHandler,
  getAllEmployeesHandler,
  getEmployeeProfileHandler,
  updateEmployeeProfileHandler,
} from "../controllers/employeeController";
import { authenticate } from "../middlewares/authMiddleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee attendance management
 */

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: Fetch all employees
 *     tags: [Employees]
 *     description: Retrieves a list of all employees in the system.
 *     responses:
 *       200:
 *         description: Successfully fetched all employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   enum: [1]
 *                   description: Indicates success (1)
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: Employee object
 *               required:
 *                 - status
 *                 - message
 *                 - payload
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   enum: [0]
 *                   description: Indicates failure (0)
 *                 message:
 *                   type: string
 *                   description: Error message
 *                 payload:
 *                   type: array
 *                   items:
 *                     type: object
 *                   description: Empty array for errors
 *               required:
 *                 - status
 *                 - message
 *                 - payload
 */
router.get("/", getAllEmployeesHandler);

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     description: Creates a new employee record and sends a registration email. Requires authentication.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employee_code
 *               - username
 *               - full_name
 *               - email
 *               - emp_type
 *               - join_date
 *               - department_id
 *               - designation_id
 *               - shift_id
 *               - team_id
 *               - address
 *               - status
 *             properties:
 *               employee_code:
 *                 type: string
 *                 description: Unique 4-character employee code
 *                 minLength: 4
 *                 maxLength: 4
 *               username:
 *                 type: string
 *                 description: Unique username (3-100 characters)
 *                 minLength: 3
 *                 maxLength: 100
 *               full_name:
 *                 type: string
 *                 description: Full name of the employee (3-100 characters)
 *                 minLength: 3
 *                 maxLength: 100
 *               fathername:
 *                 type: string
 *                 description: Father's name (3-100 characters)
 *                 minLength: 3
 *                 maxLength: 100
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee's email address
 *                 maxLength: 100
 *               emp_type:
 *                 type: string
 *                 enum: [employee, manager, admin, hr, lead]
 *                 description: Employee type
 *                 default: employee
 *               phone:
 *                 type: string
 *                 description: Phone number starting with '03' (11 characters)
 *                 pattern: '^03[0-9]{9}$'
 *                 nullable: true
 *               cnic:
 *                 type: string
 *                 description: CNIC in format 12345-1234567-1
 *                 pattern: '^\d{5}-\d{7}-\d$'
 *                 nullable: true
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Employee's gender
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth in YYYY-MM-DD format
 *                 nullable: true
 *               join_date:
 *                 type: string
 *                 format: date
 *                 description: Join date in YYYY-MM-DD format
 *               leave_date:
 *                 type: string
 *                 format: date
 *                 description: Leave date in YYYY-MM-DD format
 *                 nullable: true
 *               department_id:
 *                 type: integer
 *                 description: Department ID
 *               designation_id:
 *                 type: integer
 *                 description: Designation ID
 *               shift_id:
 *                 type: integer
 *                 description: Shift ID
 *               team_id:
 *                 type: integer
 *                 description: Team ID
 *               profile_picture:
 *                 type: string
 *                 description: URL or base64 string for profile picture
 *                 maxLength: 255
 *                 nullable: true
 *               address:
 *                 type: string
 *                 description: Employee's address
 *                 maxLength: 1000
 *               status:
 *                 type: string
 *                 enum: [active, inactive, terminated]
 *                 description: Employee status
 *                 default: active
 *               menu_rights:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     menu_id:
 *                       type: integer
 *                       description: Menu ID
 *                     can_view:
 *                       type: boolean
 *                       default: true
 *                     can_create:
 *                       type: boolean
 *                       default: false
 *                     can_edit:
 *                       type: boolean
 *                       default: false
 *                     can_delete:
 *                       type: boolean
 *                       default: false
 *                   required:
 *                     - menu_id
 *                     - can_view
 *                     - can_create
 *                     - can_edit
 *                     - can_delete
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Successfully created employee
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (e.g., duplicate employee code, username, email)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 * components:
 *   schemas:
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           enum: [1]
 *           description: Indicates success (1)
 *         message:
 *           type: string
 *           description: Success message
 *         payload:
 *           type: array
 *           items:
 *             type: object
 *           description: Employee object(s)
 *       required:
 *         - status
 *         - message
 *         - payload
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           enum: [0]
 *           description: Indicates failure (0)
 *         message:
 *           type: string
 *           description: Error message
 *         payload:
 *           type: array
 *           items:
 *             type: object
 *           description: Empty array for errors
 *       required:
 *         - status
 *         - message
 *         - payload
 */
router.post("/", authenticate, createEmployeeHandler);

/**
 * @swagger
 * /api/v1/employees/change-password:
 *   post:
 *     summary: Change employee password
 *     tags: [Employees]
 *     description: Changes the password for an employee after verifying the old password.
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
 *               - old_password
 *               - new_password
 *             properties:
 *               employee_id:
 *                 type: integer
 *                 description: The ID of the employee
 *               old_password:
 *                 type: string
 *                 description: Current password of the employee
 *               new_password:
 *                 type: string
 *                 description: New password for the employee
 *     responses:
 *       200:
 *         description: Successfully changed employee password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request (e.g., invalid old password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/change-password", changeEmployeePasswordHandler);

/**
 * @swagger
 * /api/v1/employees/profile:
 *   post:
 *     summary: Fetch employee profile
 *     tags: [Employees]
 *     description: Retrieves the profile of an employee by their ID.
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
 *                 description: The ID of the employee
 *     responses:
 *       200:
 *         description: Successfully fetched employee profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/profile", getEmployeeProfileHandler);

/**
 * @swagger
 * /api/v1/employees/update-profile:
 *   put:
 *     summary: Update employee profile
 *     tags: [Employees]
 *     description: Updates an employee's profile information.
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
 *                 description: The ID of the employee
 *               fullname:
 *                 type: string
 *                 description: Full name of the employee
 *                 maxLength: 100
 *                 nullable: true
 *               fathername:
 *                 type: string
 *                 description: Father's name
 *                 maxLength: 100
 *                 nullable: true
 *               dob:
 *                 type: string
 *                 format: date
 *                 description: Date of birth in YYYY-MM-DD format, must not be in the future
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Employee's email address
 *                 maxLength: 100
 *                 nullable: true
 *               phone:
 *                 type: string
 *                 description: Phone number starting with '03' (11 characters)
 *                 pattern: '^03[0-9]{9}$'
 *                 nullable: true
 *               cnic:
 *                 type: string
 *                 description: CNIC in format 12345-1234567-1
 *                 pattern: '^\d{5}-\d{7}-\d$'
 *                 nullable: true
 *               address:
 *                 type: string
 *                 description: Employee's address
 *                 maxLength: 1000
 *                 nullable: true
 *               profile_picture:
 *                 type: string
 *                 description: Base64-encoded image for profile picture
 *                 pattern: '^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$'
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Successfully updated employee profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/update-profile", updateEmployeeProfileHandler);

export default router;
