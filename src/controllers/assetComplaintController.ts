import { Request, Response } from "express";
import { assetComplaintRequestCreateSchema, assetComplaintRequestListingSchema, assetComplaintRequestSingleSchema } from "../validations/assetComplainValidations";
import { assetComplaintListing, assetComplaintSingle, createAssetComplaint } from "../services/assetComplaintServices";
import z from "zod";

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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};


// Module --> Asset Complaint
// Method --> POST (Protected)
// Endpoint --> /api/v1/asset-complaints/all
// Description --> Get All Asset Complaints
export const getAllAssetComplaintHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = assetComplaintRequestListingSchema.parse(req.body);

    const complaints = await assetComplaintListing(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Asset complaints fetched successfully",
      payload: complaints,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
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
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};