"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkStatus = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(utc_1.default);
const getWorkStatus = (params) => {
    const { check_in_time, check_out_time } = params;
    console.log(params);
    const checkIn = dayjs_1.default.utc(check_in_time);
    const checkOut = dayjs_1.default.utc(check_out_time, "YYYY-MM-DD HH:mm:ss");
    if (!checkIn.isValid() || !checkOut.isValid()) {
        throw new Error("Invalid check-in or check-out time format");
    }
    if (checkOut.isBefore(checkIn)) {
        throw new Error("Check-out time cannot be before check-in time");
    }
    const workingMinutes = checkOut.diff(checkIn, "minute");
    const workingHours = parseFloat((workingMinutes / 60).toFixed(2));
    let workStatus;
    if (workingHours < 4) {
        workStatus = "early_leave";
    }
    else if (workingHours <= 5) {
        workStatus = "half_day";
    }
    else if (workingHours <= 7) {
        workStatus = "early_go";
    }
    else if (workingHours <= 9) {
        workStatus = "on_time";
    }
    else {
        workStatus = "overtime";
    }
    return { working_hours: workingHours, work_status: workStatus };
};
exports.getWorkStatus = getWorkStatus;
