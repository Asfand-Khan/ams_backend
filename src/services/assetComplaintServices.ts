import prisma from "../config/db";
import {
  AssetComplaintRequestCreate,
  AssetComplaintRequestListing,
  AssetComplaintRequestSingle,
  AssetComplaintRequestUpdate,
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
  let whereClause = {} as any;

  if (data.employee_id) {
    whereClause["employee_id"] = data.employee_id;
  }

  if (data.status) {
    whereClause["status"] = data.status;
  }

  const complaints = await prisma.assetComplaintRequest.findMany({
    where: whereClause,
    include: {
      requested_by_employee: {
        select: {
          full_name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    }
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

export const assetComplaintUpdate = async (
  data: AssetComplaintRequestUpdate
) => {
  const complaint = await prisma.assetComplaintRequest.update({
    where: {
      id: data.complaint_id,
    },
    data: {
      status: data.status,
      resolution_remarks: data.remarks,
    },
  });

  return complaint;
};
