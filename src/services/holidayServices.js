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
exports.getHolidayByDate = exports.getHolidayById = exports.deleteHoliday = exports.updateHoliday = exports.createHoliday = exports.getAllHolidays = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllHolidays = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const holidays = yield db_1.default.holiday.findMany({
            where: {
                is_deleted: false,
            },
        });
        return holidays;
    }
    catch (error) {
        throw new Error(`Failed to fetch all holidays: ${error.message}`);
    }
});
exports.getAllHolidays = getAllHolidays;
const createHoliday = (holiday) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            holiday_date: new Date(holiday.holiday_date),
            title: holiday.title,
        };
        if (holiday.description) {
            data.description = holiday.description;
        }
        const newHoliday = yield db_1.default.holiday.create({
            data,
        });
        return newHoliday;
    }
    catch (error) {
        throw new Error(`Failed to create a holiday: ${error.message}`);
    }
});
exports.createHoliday = createHoliday;
const updateHoliday = (holiday) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = {
            holiday_date: new Date(holiday.holiday_date),
            title: holiday.title,
        };
        if (holiday.description) {
            data.description = holiday.description;
        }
        const updatedHoliday = yield db_1.default.holiday.update({
            where: {
                id: holiday.holiday_id,
            },
            data,
        });
        return updatedHoliday;
    }
    catch (error) {
        throw new Error(`Failed to update the holiday: ${error.message}`);
    }
});
exports.updateHoliday = updateHoliday;
const deleteHoliday = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedHoliday = yield db_1.default.holiday.update({
            where: { id },
            data: { is_deleted: true },
        });
        return deletedHoliday;
    }
    catch (error) {
        throw new Error(`Failed to delete the holiday: ${error.message}`);
    }
});
exports.deleteHoliday = deleteHoliday;
const getHolidayById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const holiday = yield db_1.default.holiday.findUnique({
            where: { id },
        });
        return holiday;
    }
    catch (error) {
        throw new Error(`Failed to fetch holiday by ID: ${error.message}`);
    }
});
exports.getHolidayById = getHolidayById;
const getHolidayByDate = (date) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const holiday = yield db_1.default.holiday.findUnique({
            where: {
                holiday_date: new Date(date),
            },
        });
        return holiday;
    }
    catch (error) {
        throw new Error(`Failed to fetch holiday by date: ${error.message}`);
    }
});
exports.getHolidayByDate = getHolidayByDate;
