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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartmentById = exports.getDepartmentByName = exports.updateDepartment = exports.createDepartment = exports.getAllDepartments = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllDepartments = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allDepartments = yield db_1.default.department.findMany({
            where: {
                is_deleted: false,
            },
        });
        return allDepartments;
    }
    catch (error) {
        throw new Error(`Failed to fetch all Departments: ${error.message}`);
    }
});
exports.getAllDepartments = getAllDepartments;
const createDepartment = (department) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: department.name,
        };
        if (department.description) {
            data["description"] = department.description;
        }
        const newDepartment = yield db_1.default.department.create({
            data,
        });
        return newDepartment;
    }
    catch (error) {
        throw new Error(`Failed to create a department: ${error.message}`);
    }
});
exports.createDepartment = createDepartment;
const updateDepartment = (department) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: department.name,
        };
        if (department.description) {
            data["description"] = department.description;
        }
        const updatedDepartment = yield db_1.default.department.update({
            data,
            where: {
                id: department.dept_id,
            },
        });
        return updatedDepartment;
    }
    catch (error) {
        throw new Error(`Failed to update a department: ${error.message}`);
    }
});
exports.updateDepartment = updateDepartment;
const getDepartmentByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.department.findUnique({
        where: { name: name.toLocaleLowerCase() },
    });
});
exports.getDepartmentByName = getDepartmentByName;
const getDepartmentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.department.findUnique({
        where: { id },
    });
});
exports.getDepartmentById = getDepartmentById;
