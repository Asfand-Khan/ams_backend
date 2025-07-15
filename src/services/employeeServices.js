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
exports.getEmployeeById = exports.getEmployeeByUsername = exports.getEmployeeByCnic = exports.getEmployeeByPhone = exports.getEmployeeByEmail = exports.getEmployeeByCode = exports.updateEmployee = exports.createEmployee = exports.getAllEmployees = void 0;
const db_1 = __importDefault(require("../config/db"));
const generateRandomHex_1 = require("../utils/generateRandomHex");
const getAllEmployees = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allEmployees = yield db_1.default.employee.findMany({
            where: {
                is_deleted: false,
            },
        });
        return allEmployees;
    }
    catch (error) {
        throw new Error(`Failed to fetch all employees: ${error.message}`);
    }
});
exports.getAllEmployees = getAllEmployees;
const createEmployee = (employee) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            email: employee.email,
            employee_code: employee.employee_code,
            full_name: employee.full_name,
            designation_id: employee.designation_id,
            department_id: employee.department_id,
            status: employee.status,
        };
        if (employee.address) {
            data["address"] = employee.address;
        }
        if (employee.cnic) {
            data["cnic"] = employee.cnic;
        }
        if (employee.phone) {
            data["phone"] = employee.phone;
        }
        if (employee.join_date)
            data["join_date"] = new Date(employee.join_date);
        if (employee.leave_date)
            data["leave_date"] = new Date(employee.leave_date);
        if (employee.dob)
            data["dob"] = new Date(employee.dob);
        if (employee.gender) {
            data["gender"] = employee.gender;
        }
        const result = yield db_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const newEmployee = yield tx.employee.create({ data });
            const user = yield tx.user.create({
                data: {
                    username: employee.username,
                    password_hash: (0, generateRandomHex_1.generateRandomHex)(16),
                    employee_id: newEmployee.id,
                    email: employee.email,
                    type: employee.emp_type,
                },
            });
            yield tx.employeeShift.create({
                data: {
                    employee_id: newEmployee.id,
                    shift_id: employee.shift_id,
                    effective_from: new Date(),
                },
            });
            if (employee.team_id) {
                yield tx.teamMember.create({
                    data: {
                        employee_id: newEmployee.id,
                        team_id: employee.team_id,
                    },
                });
            }
            return Object.assign(Object.assign({}, newEmployee), { username: user.username, password: user.password_hash });
        }));
        return result;
    }
    catch (error) {
        throw new Error(`Failed to create a employee: ${error.message}`);
    }
});
exports.createEmployee = createEmployee;
const updateEmployee = (employee) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            email: employee.email,
            employee_code: employee.employee_code,
            full_name: employee.full_name,
            designation_id: employee.designation_id,
            department_id: employee.department_id,
            status: employee.status,
        };
        if (employee.address) {
            data["address"] = employee.address;
        }
        if (employee.cnic) {
            data["cnic"] = employee.cnic;
        }
        if (employee.phone) {
            data["phone"] = employee.phone;
        }
        if (employee.join_date) {
            data["join_date"] = employee.join_date;
        }
        if (employee.leave_date) {
            data["leave_date"] = employee.leave_date;
        }
        if (employee.dob) {
            data["dob"] = employee.dob;
        }
        if (employee.gender) {
            data["gender"] = employee.gender;
        }
        const updatedEmployee = yield db_1.default.employee.update({
            data,
            where: {
                id: employee.employee_id,
            },
        });
        return updatedEmployee;
    }
    catch (error) {
        throw new Error(`Failed to update a employee: ${error.message}`);
    }
});
exports.updateEmployee = updateEmployee;
const getEmployeeByCode = (code) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.employee.findUnique({
        where: { employee_code: code },
    });
});
exports.getEmployeeByCode = getEmployeeByCode;
const getEmployeeByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.employee.findUnique({
        where: { email },
    });
});
exports.getEmployeeByEmail = getEmployeeByEmail;
const getEmployeeByPhone = (phone) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.employee.findUnique({
        where: { phone },
    });
});
exports.getEmployeeByPhone = getEmployeeByPhone;
const getEmployeeByCnic = (cnic) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.employee.findUnique({
        where: { cnic },
    });
});
exports.getEmployeeByCnic = getEmployeeByCnic;
const getEmployeeByUsername = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.user.findUnique({
        where: { username },
    });
});
exports.getEmployeeByUsername = getEmployeeByUsername;
const getEmployeeById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.employee.findUnique({
        where: { id },
    });
});
exports.getEmployeeById = getEmployeeById;
