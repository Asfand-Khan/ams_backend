import { z } from "zod";
import { ActivityAction, ProjectStatus } from "@prisma/client";

// ── Base schema (without refine) ─────────────────────────────────────
export const projectFilterBaseSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid startDate format. Use YYYY-MM-DD",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid endDate format. Use YYYY-MM-DD",
    }),
  statuses: z.array(z.nativeEnum(ProjectStatus)).optional(),
  createdByIds: z.array(z.number().int().positive()).optional(),
  assigneeIds: z.array(z.number().int().positive()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// ── Final filter schema with business rules ──────────────────────────
export const projectFilterSchema = projectFilterBaseSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: "startDate cannot be after endDate",
    path: ["startDate"],
  },
);

export type ProjectFilter = z.infer<typeof projectFilterSchema>;

// ── Other schemas ────────────────────────────────────────────────────
export const projectCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name cannot exceed 100 characters"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  status: z.enum(["active", "on_hold", "completed", "archived"]).optional(),
  assignee_ids: z.array(z.number().int().positive()).optional(),
});

export const projectUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Project name must be at least 1 character")
    .max(100, "Project name cannot exceed 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  status: z.enum(["active", "on_hold", "completed", "archived"]).optional(),
  assignee_ids: z.array(z.number().int().positive()).optional(),
});

export const projectAssigneesSchema = z.object({
  add: z.array(z.number().int().positive()).optional().default([]),
  remove: z.array(z.number().int().positive()).optional().default([]),
});

export const taskStatusSchema = z.object({
  name: z.string().min(1, "Status name is required"),
  color: z.string().optional(),
});

export const projectCommentSchema = z.object({
  comment: z.string().min(1, "Comment is required").max(2000),
});

export const projectLogFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  actions: z.array(z.nativeEnum(ActivityAction)).optional(),
  performedByIds: z.array(z.number().int().positive()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type ProjectCreate = z.infer<typeof projectCreateSchema>;
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;
export type ProjectLogFilter = z.infer<typeof projectLogFilterSchema>;
