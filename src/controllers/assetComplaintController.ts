import { NextFunction, Request, Response } from "express";
import {
  assetComplaintRequestCreateSchema,
  assetComplaintRequestListingSchema,
  assetComplaintRequestSingleSchema,
  assetComplaintRequestUpdateSchema,
} from "../validations/assetComplainValidations";
import {
  assetComplaintListing,
  assetComplaintSingle,
  assetComplaintUpdate,
  createAssetComplaint,
} from "../services/assetComplaintServices";
import { handleAppError } from "../utils/appErrorHandler";
import { AuthRequest } from "../types/types";

// Module --> Asset Complaint
// Method --> POST (Protected)
// Endpoint --> /api/v1/asset-complaints
// Description --> Create Asset Complaint
export const createAssetComplaintHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = assetComplaintRequestCreateSchema.parse(req.body);

    const complaint = await createAssetComplaint(parsedData);

    return res.status(201).json({
      status: 1,
      message: "Asset complaint created successfully",
      payload: [complaint],
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

// Module --> Asset Complaint
// Method --> POST (Protected)
// Endpoint --> /api/v1/asset-complaints/all
// Description --> Get All Asset Complaints
export const getAllAssetComplaintHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Ensure user is authenticated
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }

    const parsedData = assetComplaintRequestListingSchema.parse(req.body); // Assuming schema is defined
    const complaints = await assetComplaintListing(parsedData, req.userRecord);

    return res.status(200).json({
      status: 1,
      message: "Asset complaints fetched successfully",
      payload: complaints,
    });
  } catch (error) {
    const err = handleAppError(error); // Assuming handleAppError is defined
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Asset Complaint
// Method --> POST (Protected)
// Endpoint --> /api/v1/asset-complaints/single
// Description --> Get Single Asset Complaint
export const getSingleAssetComplaintHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = assetComplaintRequestSingleSchema.parse(req.body);

    const complaint = await assetComplaintSingle(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Asset complaint fetched successfully",
      payload: complaint,
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

// Module --> Asset Complaint
// Method --> PUT (Protected)
// Endpoint --> /api/v1/asset-complaints/
// Description --> Update Asset Complaint
export const updateAssetComplaintHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = assetComplaintRequestUpdateSchema.parse(req.body);

    const complaint = await assetComplaintUpdate(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Asset complaint updated successfully",
      payload: complaint,
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
