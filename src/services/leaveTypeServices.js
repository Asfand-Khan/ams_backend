"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLeaveType = exports.updateLeaveType = exports.createLeaveType = exports.getLeaveTypes = void 0;
const db_1 = __importDefault(require("../config/db"));
const getLeaveTypes = () => {
    return db_1.default.leaveType.findMany({
        where: { is_deleted: false }
    });
};
exports.getLeaveTypes = getLeaveTypes;
const createLeaveType = (data) => {
    return db_1.default.leaveType.create({ data });
};
exports.createLeaveType = createLeaveType;
const updateLeaveType = (id, data) => {
    return db_1.default.leaveType.update({ where: { id }, data });
};
exports.updateLeaveType = updateLeaveType;
const deleteLeaveType = (id) => {
    return db_1.default.leaveType.update({
        where: { id },
        data: { is_deleted: true }
    });
};
exports.deleteLeaveType = deleteLeaveType;
