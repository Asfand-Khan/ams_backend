"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDepartmentHandler = exports.getSingleDepartmentHandler = exports.createEmployeeHandler = exports.getAllDepartmentsHandler = void 0;
const zod_1 = require("zod");
const departmentServices_1 = require("../services/departmentServices");
const departmentValidations_1 = require("../validations/departmentValidations");
const employeeValidations_1 = require("../validations/employeeValidations");
const employeeServices_1 = require("../services/employeeServices");
const sendEmail_1 = require("../utils/sendEmail");
const signUpTemplate_1 = require("../utils/signUpTemplate");
// Module --> Employee
// Method --> GET (Protected)
// Endpoint --> /api/v1/employees
// Description --> Fetch all employees
const getAllDepartmentsHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const departments = yield (0, departmentServices_1.getAllDepartments)();
        return res.status(200).json({
            status: 1,
            message: "Departments fetched successfully",
            payload: departments,
        });
    }
    catch (error) {
        return res.status(500).json({
            status: 0,
            message: error.message,
            payload: [],
        });
    }
});
exports.getAllDepartmentsHandler = getAllDepartmentsHandler;
// Module --> Employee
// Method --> POST (Protected)
// Endpoint --> /api/v1/employees
// Description --> Create employee
const createEmployeeHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedEmployee = employeeValidations_1.employeeSchema.parse(req.body);
        const employeeByCode = yield (0, employeeServices_1.getEmployeeByCode)(parsedEmployee.employee_code);
        if (employeeByCode) {
            return res.status(400).json({
                status: 0,
                message: "Employee with this employee code already exists",
                payload: [],
            });
        }
        const employeeByUsername = yield (0, employeeServices_1.getEmployeeByUsername)(parsedEmployee.username);
        if (employeeByUsername) {
            return res.status(400).json({
                status: 0,
                message: "Employee with this username already exists",
                payload: [],
            });
        }
        const employeeByEmail = yield (0, employeeServices_1.getEmployeeByEmail)(parsedEmployee.email);
        if (employeeByEmail) {
            return res.status(400).json({
                status: 0,
                message: "Employee with this email already exists",
                payload: [],
            });
        }
        if (parsedEmployee.cnic) {
            const employeeByCnic = yield (0, employeeServices_1.getEmployeeByCnic)(parsedEmployee.cnic);
            if (employeeByCnic) {
                return res.status(400).json({
                    status: 0,
                    message: "Employee with this cnic already exists",
                    payload: [],
                });
            }
        }
        if (parsedEmployee.phone) {
            const employeeByPhone = yield (0, employeeServices_1.getEmployeeByPhone)(parsedEmployee.phone);
            if (employeeByPhone) {
                return res.status(400).json({
                    status: 0,
                    message: "Employee with this phone number already exists",
                    payload: [],
                });
            }
        }
        const newEmployee = yield (0, employeeServices_1.createEmployee)(parsedEmployee);
        if (newEmployee) {
            yield (0, sendEmail_1.sendEmail)({
                to: newEmployee.email,
                subject: "Employee Registration",
                html: (0, signUpTemplate_1.getSignUpTemplate)(newEmployee.full_name, newEmployee.username, newEmployee.password, "https://getorio.com/"),
            });
        }
        return res.status(201).json({
            status: 1,
            message: "Employee created successfully",
            payload: [newEmployee],
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: 0,
                message: error.errors[0].message,
                payload: [],
            });
        }
        return res.status(500).json({
            status: 0,
            message: error.message,
            payload: [],
        });
    }
});
exports.createEmployeeHandler = createEmployeeHandler;
// Module --> Department
// Method --> GET (Protected)
// Endpoint --> /api/v1/departments/:id
// Description --> Get single department
const getSingleDepartmentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deptId = parseInt(req.params.id);
        if (isNaN(deptId) || deptId <= 0) {
            throw new Error("Invalid department id or department id can not be 0");
        }
        const singleDepartment = yield (0, departmentServices_1.getDepartmentById)(deptId);
        if (!singleDepartment) {
            throw new Error("Department not found");
        }
        return res.status(200).json({
            status: 1,
            message: "Fetched single department successfully",
            payload: [singleDepartment],
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: 0,
                message: error.errors[0].message,
                payload: [],
            });
        }
        return res.status(500).json({
            status: 0,
            message: error.message,
            payload: [],
        });
    }
});
exports.getSingleDepartmentHandler = getSingleDepartmentHandler;
// Module --> Department
// Method --> PUT (Protected)
// Endpoint --> /api/v1/departments/
// Description --> Update department
const updateDepartmentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedDepartment = departmentValidations_1.DepartmentUpdateSchema.parse(req.body);
        const updatedDepartment = yield (0, departmentServices_1.updateDepartment)(parsedDepartment);
        return res.status(200).json({
            status: 1,
            message: "Department updated successfully",
            payload: [updatedDepartment],
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: 0,
                message: error.errors[0].message,
                payload: [],
            });
        }
        return res.status(500).json({
            status: 0,
            message: error.message,
            payload: [],
        });
    }
});
exports.updateDepartmentHandler = updateDepartmentHandler;
