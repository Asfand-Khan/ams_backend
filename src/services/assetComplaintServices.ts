import prisma from "../config/db";
import {
  AssetComplaintRequestCreate,
  AssetComplaintRequestListing,
  AssetComplaintRequestSingle,
} from "../validations/assetComplainValidations";

export const createAssetComplaint = async (
  data: AssetComplaintRequestCreate
) => {
  try {
    const complaint = await prisma.assetComplaintRequest.create({
      data: {
        employee_id: data.employee_id,
        request_type: data.request_type,
        asset_type: data.asset_type,
        reason: data.reason,
        category: data.category,
      },
    });

    return complaint;
  } catch (error: any) {
    throw new Error(`Failed to create asset complaint: ${error.message}`);
  }
};

export const assetComplaintListing = async (
  data: AssetComplaintRequestListing
) => {
  try {
    let whereClause = {
      employee_id: data.employee_id,
    } as any;

    if (data.status) {
      whereClause["status"] = data.status;
    }

    const complaints = await prisma.assetComplaintRequest.findMany({
      where: whereClause,
    });

    return complaints;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch asset complaints listing: ${error.message}`
    );
  }
};

export const assetComplaintSingle = async (
  data: AssetComplaintRequestSingle
) => {
  try {
    const complaint = await prisma.assetComplaintRequest.findUnique({
      where: {
        id: data.complaint_id,
      },
    });

    return complaint;
  } catch (error: any) {
    throw new Error(
      `Failed to fetch single asset complaint listing: ${error.message}`
    );
  }
};
