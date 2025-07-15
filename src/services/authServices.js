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
exports.verifyOTP = exports.generateOTP = exports.comparePassword = exports.getUserByUsername = exports.login = void 0;
const db_1 = __importDefault(require("../config/db"));
const crypto_1 = __importDefault(require("crypto"));
const login = () => __awaiter(void 0, void 0, void 0, function* () {
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
exports.login = login;
const getUserByUsername = (username) => {
    try {
        return db_1.default.user.findUnique({
            where: { username },
            include: {
                employee: true,
            },
        });
    }
    catch (error) {
        throw new Error(`Failed to fetch user by username: ${error.message}`);
    }
};
exports.getUserByUsername = getUserByUsername;
const comparePassword = (password, oldPassword) => {
    try {
        return password === oldPassword;
    }
    catch (error) {
        throw new Error(`Failed to compare password: ${error.message}`);
    }
};
exports.comparePassword = comparePassword;
const generateOTP = (username) => __awaiter(void 0, void 0, void 0, function* () {
    return yield db_1.default.user.update({
        select: { otp_token: true },
        where: { username },
        data: {
            otp_token: crypto_1.default.randomInt(100000, 1000000).toString(),
        },
    });
});
exports.generateOTP = generateOTP;
const verifyOTP = (otp, systemOtp, username) => __awaiter(void 0, void 0, void 0, function* () {
    if (otp !== systemOtp)
        return false;
    yield db_1.default.user.update({
        select: { otp_token: true },
        where: { username },
        data: {
            otp_token: null,
        },
    });
    return true;
});
exports.verifyOTP = verifyOTP;
