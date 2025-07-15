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
exports.checkIfEndTimeIsGreaterThanStartTime = exports.getShiftById = exports.getShiftByName = exports.updateShift = exports.createShift = exports.getAllShifts = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllShifts = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allShifts = yield db_1.default.shift.findMany({
            where: {
                is_deleted: false,
            },
        });
        return allShifts;
    }
    catch (error) {
        throw new Error(`Failed to fetch all shifts: ${error.message}`);
    }
});
exports.getAllShifts = getAllShifts;
const createShift = (shift) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: shift.name,
            end_time: shift.end_time,
            start_time: shift.start_time,
        };
        if (shift.break_duration_minutes) {
            data["break_duration_minutes"] = shift.break_duration_minutes;
        }
        if (shift.early_leave_threshold_minutes) {
            data["early_leave_threshold_minutes"] =
                shift.early_leave_threshold_minutes;
        }
        if (shift.grace_minutes) {
            data["grace_minutes"] = shift.grace_minutes;
        }
        if (shift.half_day_hours) {
            data["half_day_hours"] = shift.half_day_hours;
        }
        const newShift = yield db_1.default.shift.create({
            data,
        });
        return newShift;
    }
    catch (error) {
        throw new Error(`Failed to create a shift: ${error.message}`);
    }
});
exports.createShift = createShift;
const updateShift = (shift) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            name: shift.name,
            end_time: shift.end_time,
            start_time: shift.start_time,
        };
        if (shift.break_duration_minutes) {
            data["break_duration_minutes"] = shift.break_duration_minutes;
        }
        if (shift.early_leave_threshold_minutes) {
            data["early_leave_threshold_minutes"] =
                shift.early_leave_threshold_minutes;
        }
        if (shift.grace_minutes) {
            data["grace_minutes"] = shift.grace_minutes;
        }
        if (shift.half_day_hours) {
            data["half_day_hours"] = shift.half_day_hours;
        }
        const updatedShift = yield db_1.default.shift.update({
            data,
            where: {
                id: shift.shift_id
            }
        });
        return updatedShift;
    }
    catch (error) {
        throw new Error(`Failed to update a shift: ${error.message}`);
    }
});
exports.updateShift = updateShift;
const getShiftByName = (name) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.shift.findUnique({
        where: { name: name.toLocaleLowerCase() },
    });
});
exports.getShiftByName = getShiftByName;
const getShiftById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return db_1.default.shift.findUnique({
        where: { id },
    });
});
exports.getShiftById = getShiftById;
const checkIfEndTimeIsGreaterThanStartTime = (start_time, end_time) => {
    const start = Date.parse(`1970-01-01T${start_time}Z`);
    const end = Date.parse(`1970-01-01T${end_time}Z`);
    return end > start;
};
exports.checkIfEndTimeIsGreaterThanStartTime = checkIfEndTimeIsGreaterThanStartTime;
