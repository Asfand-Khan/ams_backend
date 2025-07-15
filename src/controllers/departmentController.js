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
exports.updateDepartmentHandler = exports.getSingleDepartmentHandler = exports.createDepartmentHandler = exports.getAllDepartmentsHandler = void 0;
const zod_1 = require("zod");
const departmentServices_1 = require("../services/departmentServices");
const departmentValidations_1 = require("../validations/departmentValidations");
// Module --> Department
// Method --> GET (Protected)
// Endpoint --> /api/v1/departments
// Description --> Fetch all departments
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
// Module --> Departments
// Method --> POST (Protected)
// Endpoint --> /api/v1/departments
// Description --> Create Department
const createDepartmentHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedDepartment = departmentValidations_1.DepartmentSchema.parse(req.body);
        const departmentByName = yield (0, departmentServices_1.getDepartmentByName)(parsedDepartment.name);
        if (departmentByName) {
            return res.status(400).json({
                status: 0,
                message: "Department with this name already exists",
                payload: [],
            });
        }
        const newDepartment = yield (0, departmentServices_1.createDepartment)(parsedDepartment);
        return res.status(201).json({
            status: 1,
            message: "Department created successfully",
            payload: [newDepartment],
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
exports.createDepartmentHandler = createDepartmentHandler;
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
