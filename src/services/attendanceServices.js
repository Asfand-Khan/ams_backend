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
exports.getEmployeeAttendance = exports.markCheckIn = exports.ifCheckInExists = exports.getEmployeeShift = void 0;
const db_1 = __importDefault(require("../config/db"));
const getEmployeeShift = (emp_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeShift = (yield db_1.default.$queryRaw `SELECT s.* FROM EmployeeShift es LEFT JOIN Shift s ON es.shift_id = s.id WHERE es.employee_id = ${emp_id}`);
        return employeeShift[0];
    }
    catch (error) {
        throw new Error(`Failed to fetch employee shift: ${error.message}`);
    }
});
exports.getEmployeeShift = getEmployeeShift;
const ifCheckInExists = (emp_id, // 12
attendance_date // 2025-07-15 09:00:00
) => __awaiter(void 0, void 0, void 0, function* () {
    const checkInExists = (yield db_1.default.$queryRaw `SELECT COUNT(*) as cnt FROM Attendance WHERE employee_id = ${emp_id} AND date = ${attendance_date.split(" ")[0]}`);
    return Number(checkInExists[0].cnt) || null;
});
exports.ifCheckInExists = ifCheckInExists;
const markCheckIn = (data, checkInStatus) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const attendance = yield db_1.default.attendance.create({
            data: {
                employee_id: data.employee_id,
                date: new Date(data.attendance_date),
                check_in_time: new Date(data.check_in_time),
                check_in_status: checkInStatus,
                check_in_office_id: data.check_in_office_location,
            },
        });
        return attendance;
    }
    catch (error) {
        throw new Error(`Failed to mark check-in: ${error.message}`);
    }
});
exports.markCheckIn = markCheckIn;
const getEmployeeAttendance = (emp_id, date) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const employeeAttendance = (yield db_1.default.$queryRaw `SELECT * FROM Attendance WHERE employee_id = ${emp_id} AND date = ${date.split(" ")[0]}`);
        return employeeAttendance[0];
    }
    catch (error) {
        throw new Error(`Failed to fetch employee attendance: ${error.message}`);
    }
});
exports.getEmployeeAttendance = getEmployeeAttendance;
