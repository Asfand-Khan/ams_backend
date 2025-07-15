"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const departmentRoutes_1 = __importDefault(require("./departmentRoutes"));
const employeeRoutes_1 = __importDefault(require("./employeeRoutes"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const attendanceRoute_1 = __importDefault(require("./attendanceRoute"));
const leaveTypeRoutes_1 = __importDefault(require("./leaveTypeRoutes"));
const router = (0, express_1.Router)();
// Mount specific resource routes
router.use('/auth', authRoutes_1.default);
router.use('/employees', employeeRoutes_1.default);
router.use('/departments', departmentRoutes_1.default);
router.use('/attendances', attendanceRoute_1.default);
router.use('/leave-types', leaveTypeRoutes_1.default);
exports.default = router;
