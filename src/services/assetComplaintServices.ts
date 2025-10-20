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
  data: AssetComplaintRequestListing,
  user: any
) => {
  // Fetch the user record to get the user type
  const userRecord = await prisma.user.findFirst({
    where: { employee_id: user.id },
    select: { type: true },
  });

  if (!userRecord) {
    throw new Error("User not found");
  }

  const userType = userRecord.type;

  let whereClause: any = {
    is_deleted: false,
  };

  // Apply filters from request body
  if (data.employee_id) {
    whereClause.employee_id = data.employee_id;
  }

  if (data.status) {
    whereClause.status = data.status;
  }

  // User type-based filtering
  if (userType === "employee") {
    // Employees see only their own complaints
    whereClause.employee_id = user.id;
  } else if (userType === "lead") {
    // Leads see complaints from their team members
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: {
          team_lead_id: user.id,
        },
        is_active: true,
        is_deleted: false,
      },
      select: {
        employee_id: true,
      },
    });

    const employeeIds = teamMembers.map((member) => member.employee_id);
    // Include the lead's own complaints
    employeeIds.push(user.id);

    if (employeeIds.length === 0) {
      return [];
    }

    // If employee_id filter is already applied, ensure it aligns with team members
    if (whereClause.employee_id) {
      if (!employeeIds.includes(whereClause.employee_id)) {
        return [];
      }
    } else {
      whereClause.employee_id = { in: employeeIds };
    }
  }
  // For admin and hr, no additional employee_id filter (see all complaints)

  const complaints = await prisma.assetComplaintRequest.findMany({
    where: whereClause,
    include: {
      requested_by_employee: {
        select: {
          full_name: true,
        },
      },
      reviewed_by_employee: {
        select: {
          full_name: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Map the response to match the provided example format
  return complaints.map((complaint) => ({
    id: Number(complaint.id),
    employee_id: Number(complaint.employee_id),
    reviewed_by: complaint.reviewed_by ? Number(complaint.reviewed_by) : null,
    request_type: complaint.request_type,
    category: complaint.category,
    asset_type: complaint.asset_type,
    reason: complaint.reason,
    status: complaint.status,
    requested_at: complaint.requested_at.toISOString(),
    reviewed_at: complaint.reviewed_at ? complaint.reviewed_at.toISOString() : null,
    resolution_remarks: complaint.resolution_remarks,
    is_active: complaint.is_active,
    is_deleted: complaint.is_deleted,
    created_at: complaint.created_at.toISOString(),
    updated_at: complaint.updated_at.toISOString(),
    requested_by_employee: complaint.requested_by_employee,
    reviewed_by_employee: complaint.reviewed_by_employee
      ? { full_name: complaint.reviewed_by_employee.full_name }
      : null
  }));
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
  data: AssetComplaintRequestUpdate,
   reviewed_by: number
) => {
  const complaint = await prisma.assetComplaintRequest.update({
    where: {
      id: data.complaint_id,
    },
    data: {
      status: data.status,
      resolution_remarks: data.remarks,
      reviewed_by,
      reviewed_at: new Date(),
      updated_at: new Date(),
    },
  });

  return complaint;
};
