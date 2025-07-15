"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveTypeSchema = void 0;
const zod_1 = require("zod");
exports.leaveTypeSchema = zod_1.z.object({
    name: zod_1.z.enum(['sick', 'casual', 'annual']),
    total_quota: zod_1.z.number().min(0),
    is_active: zod_1.z.boolean().optional().default(true),
    is_deleted: zod_1.z.boolean().optional().default(false)
});
