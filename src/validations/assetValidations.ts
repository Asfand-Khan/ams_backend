import { z } from "zod";
import { AssetStatus, AssetType, AssetImageType } from "@prisma/client";
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const assetImageItemSchema = z.object({
  base64: z.string().min(100, "Invalid base64 image data"),
  image_type: z.nativeEnum(AssetImageType),
  description: z.string().max(500).optional(),
});

export const assetCreateSchema = z.object({
  type: z.nativeEnum(AssetType),
  serial_number: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  purchase_date: z.string({ required_error: "Purchase date is required" })
    .regex(dateRegex, "Purchase date must be in 'YYYY-MM-DD' format").optional(),
  warranty_end: z.string({ required_error: "Warranty End date is required" })
    .regex(dateRegex, "Warranty End date must be in 'YYYY-MM-DD' format").optional(),
  
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(AssetStatus).optional().default(AssetStatus.available),
  quantity: z.number().int().min(1).optional().default(1), 
  images: z.array(assetImageItemSchema).optional().default([]),
});

export const assetUpdateSchema = z.object({
  type: z.nativeEnum(AssetType).optional(),
  serial_number: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
   purchase_date: z.string({ required_error: "Purchase date is required" })
    .regex(dateRegex, "Purchase date must be in 'YYYY-MM-DD' format").optional(),
  warranty_end: z.string({ required_error: "Warranty End date is required" })
    .regex(dateRegex, "Warranty End date must be in 'YYYY-MM-DD' format").optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.nativeEnum(AssetStatus).optional(),
  add_images: z.array(assetImageItemSchema).optional().default([]),
  remove_image_ids: z.array(z.number().int().positive()).optional().default([]),
});

export const assetAssignSchema = z.object({
  asset_id: z.number().int().positive(),
  employee_id: z.number().int().positive(),
  condition_on_assign: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  assignment_images: z.array(assetImageItemSchema).optional().default([]),
});

export const assetReturnSchema = z.object({
  assignment_id: z.number().int().positive(),
  condition_on_return: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  return_images: z.array(assetImageItemSchema).optional().default([]),
});

export const assetFilterSchema = z
  .object({
    type: z.nativeEnum(AssetType).optional(),
    status: z.nativeEnum(AssetStatus).optional(),
    assigned_by: z.number().int().positive().optional(),
    assigned_to: z.number().int().positive().optional(),
    start_date: z.string().date().optional(),
    end_date: z.string().date().optional(),
    page: z.number().int().min(1).optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20),
  })
  .refine(
    (data) =>
      (!data.start_date && !data.end_date) ||
      (data.start_date && data.end_date),
    {
      message: "start_date and end_date must be provided together",
      path: ["start_date"],
    }
  );
