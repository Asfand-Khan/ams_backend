import { Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import { AuthRequest } from "../types/types"; // assuming you have this
import {
  allMenus,
  getSingleMenu,
  createMenuItem,
  updateMenuItem,
  updateMenuSorting,
} from "../services/menuServices";
import { MenuType } from "@prisma/client";

// Validation schemas (zod) - recommended
import { z } from "zod";

// Module --> Menu
// Method --> GET (Protected)
// Endpoint --> /api/v1/menus
// Description --> Fetch all menus
export const getAllMenusHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const menus = await allMenus();
    return res.status(200).json({
      status: 1,
      message: "All menus fetched successfully",
      payload: menus,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

const menuCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  parent_id: z.number().int().nullable().optional(),
  url: z.string().optional().or(z.literal("")),
  icon: z.string().optional().nullable(),
  sorting: z.number().int().optional(),
  type: z.enum(["teamlist", "hrm"]).optional(),
});

const menuUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  parent_id: z.number().int().nullable().optional(),
  url: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  sorting: z.number().int().optional(),
  type: z.enum(["teamlist", "hrm"]).optional(),
  is_active: z.boolean().optional(),
});

const menuSortingSchema = z.array(
  z.object({
    id: z.number().int(),
    sorting: z.number().int(),
  })
);

// ────────────────────────────────────────────────
// GET /api/v1/menus/:id
// ────────────────────────────────────────────────
export const getSingleMenuHandler = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ status: 0, message: "Invalid menu ID", payload: null });
    }

    const menu = await getSingleMenu(id);

    return res.status(200).json({
      status: 1,
      message: "Menu fetched successfully",
      payload: menu,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: null,
    });
  }
};

// ────────────────────────────────────────────────
// POST /api/v1/menus
// ────────────────────────────────────────────────
export const createMenuHandler = async (req: AuthRequest, res: Response) => {
  try {
    const parsed = menuCreateSchema.parse(req.body);

    if (!req.userRecord?.id) {
      return res.status(401).json({ status: 0, message: "Unauthorized", payload: null });
    }

    const newMenu = await createMenuItem(parsed, req.userRecord.id);

    return res.status(201).json({
      status: 1,
      message: "Menu item created successfully",
      payload: newMenu,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: null,
    });
  }
};

// ────────────────────────────────────────────────
// PUT /api/v1/menus/:id
// ────────────────────────────────────────────────
export const updateMenuHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ status: 0, message: "Invalid menu ID", payload: null });
    }

    const parsed = menuUpdateSchema.parse(req.body);

    if (!req.userRecord?.id) {
      return res.status(401).json({ status: 0, message: "Unauthorized", payload: null });
    }

    const updated = await updateMenuItem(id, parsed, req.userRecord.id);

    return res.status(200).json({
      status: 1,
      message: "Menu updated successfully",
      payload: updated,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: null,
    });
  }
};

// ────────────────────────────────────────────────
// PATCH /api/v1/menus/sort
// Body: [ { "id": 5, "sorting": 1 }, { "id": 3, "sorting": 2 }, ... ]
// ────────────────────────────────────────────────
export const updateMenuSortingHandler = async (req: AuthRequest, res: Response) => {
  try {
    const items = menuSortingSchema.parse(req.body);

    if (!req.userRecord?.id) {
      return res.status(401).json({ status: 0, message: "Unauthorized", payload: null });
    }

    const result = await updateMenuSorting(items, req.userRecord.id);

    return res.status(200).json({
      status: 1,
      message: result.message,
      payload: { updatedCount: result.updatedCount },
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: null,
    });
  }
};