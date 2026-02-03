import { AuthRequest } from "../types/types";
import { Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  createAsset,
  updateAsset,
  assignAsset,
  returnAsset,
  getAllAssets,
  getAssetById,
  getEmployeeAssets,
  getAssetHistory,
} from "../services/assetServices";
import {
  assetCreateSchema,
  assetUpdateSchema,
  assetAssignSchema,
  assetReturnSchema,
  assetFilterSchema,
} from "../validations/assetValidations";

// POST /api/v1/assets
export const createAssetHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userRecord?.id) {
      return res
        .status(401)
        .json({ status: 0, message: "Unauthorized", payload: [] });
    }

    const parsed = assetCreateSchema.parse(req.body);
    const result = await createAsset(parsed, req.userRecord.id);

    return res.status(201).json({
      status: 1,
      message: "Asset(s) created successfully",
      payload: result,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// PUT /api/v1/assets/:id
export const updateAssetHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid asset ID", payload: [] });
    }

    if (!req.userRecord?.id) {
      return res
        .status(401)
        .json({ status: 0, message: "Unauthorized", payload: [] });
    }

    const parsed = assetUpdateSchema.parse(req.body);
    const result = await updateAsset(id, parsed, req.userRecord.id);

    return res.status(200).json({
      status: 1,
      message: "Asset updated successfully",
      payload: [result],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// POST /api/v1/assets/assign
export const assignAssetHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userRecord?.id) {
      return res
        .status(401)
        .json({ status: 0, message: "Unauthorized", payload: [] });
    }

    const parsed = assetAssignSchema.parse(req.body);
    const result = await assignAsset(parsed, req.userRecord.id);

    return res.status(201).json({
      status: 1,
      message: "Asset assigned successfully",
      payload: [result],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// POST /api/v1/assets/return
export const returnAssetHandler = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userRecord?.id) {
      return res
        .status(401)
        .json({ status: 0, message: "Unauthorized", payload: [] });
    }

    const parsed = assetReturnSchema.parse(req.body);
    const result = await returnAsset(parsed, req.userRecord.id);

    return res.status(200).json({
      status: 1,
      message: "Asset returned successfully",
      payload: [result],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// POST /api/v1/assets/list
export const getAllAssetsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const filters = assetFilterSchema.parse(req.body);

    const result = await getAllAssets(filters);

    return res.status(200).json({
      status: 1,
      message: "Assets fetched successfully",
      payload: result.assets,
      meta: result.pagination,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// GET /api/v1/assets/:id
export const getAssetByIdHandler = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid asset ID", payload: [] });
    }

    const asset = await getAssetById(id);

    return res.status(200).json({
      status: 1,
      message: "Asset details fetched successfully",
      payload: [asset],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 404).json({
      status: 0,
      message: err.message || "Asset not found",
      payload: [],
    });
  }
};

// GET /api/v1/employees/:employeeId/assets
export const getEmployeeAssetsHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const employeeId = Number(req.params.employeeId);
    if (isNaN(employeeId)) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid employee ID", payload: [] });
    }

    const assets = await getEmployeeAssets(employeeId);

    return res.status(200).json({
      status: 1,
      message: "Employee assigned assets fetched successfully",
      payload: assets,
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 400).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

export const getAssetHistoryHandler = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ status: 0, message: "Invalid asset ID", payload: [] });
    }

    const history = await getAssetHistory(id);

    return res.status(200).json({
      status: 1,
      message: "Asset history fetched successfully",
      payload: [history],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status || 404).json({
      status: 0,
      message: err.message || "Asset not found",
      payload: [],
    });
  }
};
