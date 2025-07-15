"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamUpdateSchema = exports.teamSchema = void 0;
const zod_1 = require("zod");
exports.teamSchema = zod_1.z.object({
    name: zod_1.z
        .string({
        required_error: "Team name is required.",
        invalid_type_error: "Team name must be a string.",
    })
        .min(2, { message: "Team name must be at least 2 characters." })
        .max(100, { message: "Team name must not exceed 100 characters." })
        .toLowerCase(),
    description: zod_1.z
        .string({
        invalid_type_error: "Description must be a string.",
    })
        .max(1000, { message: "Description must not exceed 1000 characters." })
        .optional()
        .nullable(),
    team_lead_id: zod_1.z
        .number({
        invalid_type_error: "Team lead ID must be a number.",
    })
        .int({ message: "Team lead ID must be an integer." })
        .positive({ message: "Team lead ID must be a positive integer." }),
    department_id: zod_1.z
        .number({
        invalid_type_error: "Department ID must be a number.",
    })
        .int({ message: "Department ID must be an integer." })
        .positive({ message: "Department ID must be a positive integer." }),
});
exports.teamUpdateSchema = exports.teamSchema.extend({
    team_id: zod_1.z
        .number({
        required_error: "Team ID is required.",
        invalid_type_error: "Team ID must be a number.",
    })
        .int("Team ID must be an integer"),
});
