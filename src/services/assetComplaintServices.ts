import prisma from "../config/db";
import {
  AssetComplaintRequestCreate,
  AssetComplaintRequestListing,
  AssetComplaintRequestSingle,
} from "../validations/assetComplainValidations";

export const createAssetComplaint = async (
  data: AssetComplaintRequestCreate
) => {
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
};

export const assetComplaintListing = async (
  data: AssetComplaintRequestListing
) => {
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
};

export const assetComplaintSingle = async (
  data: AssetComplaintRequestSingle
) => {
  const complaint = await prisma.assetComplaintRequest.findUnique({
    where: {
      id: data.complaint_id,
    },
  });

  return complaint;
};
