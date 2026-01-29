import { z } from "zod";

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

export type ProjectCreate = z.infer<typeof projectCreateSchema>;

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
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>;

export const projectAssigneesSchema = z.object({
  add: z.array(z.number().int().positive()).optional().default([]),
  remove: z.array(z.number().int().positive()).optional().default([]),
});

export const taskStatusSchema = z.object({
  name: z.string().min(1, "Status name is required"),
  color: z.string().optional(),
});

export const projectCommentSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
});

export const projectFilterSchema = z.object({
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid start date",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid end date",
    }),
  assigneeIds: z.array(z.number().int().positive()).optional(),
  statuses: z
    .array(z.enum(["active", "on_hold", "completed", "archived"]))
    .optional(),
  createdByIds: z.array(z.number().int().positive()).optional(),
});

export type ProjectFilter = z.infer<typeof projectFilterSchema>;
