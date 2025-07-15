"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckInStatus = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
const getCheckInStatus = (params) => {
    const { check_in_datetime, system_start_time, grace_minutes } = params;
    const checkInTime = dayjs_1.default.utc(check_in_datetime, "YYYY-MM-DD HH:mm:ss");
    const shiftTimeUTC = dayjs_1.default.utc(system_start_time);
    const adjustedShiftTime = dayjs_1.default.utc(`${checkInTime.format("YYYY-MM-DD")} ${shiftTimeUTC.format("HH:mm:ss")}`, "YYYY-MM-DD HH:mm:ss");
    const graceTime = adjustedShiftTime.add(grace_minutes, "minute");
    return checkInTime.isBefore(graceTime) || checkInTime.isSame(graceTime)
        ? "on_time"
        : "late";
};
exports.getCheckInStatus = getCheckInStatus;
