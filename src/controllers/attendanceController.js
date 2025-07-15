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
exports.checkOutHandler = exports.checkInHandler = void 0;
const zod_1 = require("zod");
const attendanceValidations_1 = require("../validations/attendanceValidations");
const employeeServices_1 = require("../services/employeeServices");
const attendanceServices_1 = require("../services/attendanceServices");
const getCheckInStatus_1 = require("../utils/getCheckInStatus");
const getWorkStatusAndHours_1 = require("../utils/getWorkStatusAndHours");
// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/check-in
// Description --> Mark the check-in of the employee
const checkInHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = attendanceValidations_1.checkInSchema.parse(req.body);
        const employee = yield (0, employeeServices_1.getEmployeeById)(parsedData.employee_id);
        if (!employee) {
            return res.status(404).json({
                status: 0,
                message: "Employee not found",
                payload: [],
            });
        }
        const ifAttendanceExists = yield (0, attendanceServices_1.ifCheckInExists)(employee.id, parsedData.attendance_date);
        if (ifAttendanceExists !== null) {
            throw new Error("Attendance already exists");
        }
        const shift = yield (0, attendanceServices_1.getEmployeeShift)(parsedData.employee_id);
        const checkInStatus = yield (0, getCheckInStatus_1.getCheckInStatus)({
            check_in_datetime: parsedData.check_in_time,
            system_start_time: shift.start_time,
            grace_minutes: shift.grace_minutes,
        });
        const attendance = yield (0, attendanceServices_1.markCheckIn)(parsedData, checkInStatus);
        return res.status(200).json({
            status: 1,
            message: "Employee checked-in successfully",
            payload: [attendance],
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
exports.checkInHandler = checkInHandler;
// Module --> Attendance
// Method --> GET (Protected)
// Endpoint --> /api/v1/attendances/check-out
// Description --> Mark the check-out of the employee
const checkOutHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const parsedData = attendanceValidations_1.checkOutSchema.parse(req.body);
        const employee = yield (0, employeeServices_1.getEmployeeById)(parsedData.employee_id);
        if (!employee) {
            return res.status(404).json({
                status: 0,
                message: "Employee not found",
                payload: [],
            });
        }
        const attendance = yield (0, attendanceServices_1.getEmployeeAttendance)(parsedData.employee_id, parsedData.attendance_date);
        if (attendance == null) {
            throw new Error("Attendance not found");
        }
        console.log(new Date("2025-07-15T04:19:00.000Z"));
        const work_status = yield (0, getWorkStatusAndHours_1.getWorkStatus)({
            check_in_time: attendance.check_in_time,
            check_out_time: parsedData.check_out_time,
        });
        console.log(work_status);
        // const checkInStatus = await getCheckInStatus({
        //   check_in_datetime: parsedData.check_in_time,
        //   system_start_time: shift.start_time,
        //   grace_minutes: shift.grace_minutes,
        // });
        // const attendance = await markCheckIn(parsedData, checkInStatus);
        return res.status(200).json({
            status: 1,
            message: "Employee checked-in successfully",
            payload: [attendance],
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
exports.checkOutHandler = checkOutHandler;
