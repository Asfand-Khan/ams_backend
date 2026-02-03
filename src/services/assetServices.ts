import prisma from "../config/db";
import { AssetStatus, AssetImageType } from "@prisma/client";
import {
  saveBase64Image,
  extractImageAndExtension,
} from "../utils/base64Helpers";
import { generateRandomHex } from "../utils/generateRandomHex";
import {
  assetCreateSchema,
  assetUpdateSchema,
  assetAssignSchema,
  assetReturnSchema,
  assetFilterSchema,
} from "../validations/assetValidations";
import z from "zod";

async function saveAndCreateImages(
  tx: any,
  assetId: number,
  images: Array<{
    base64: string;
    image_type: AssetImageType;
    description?: string;
  }>,
  uploadedBy: number,
) {
  const savedImages: any[] = [];

  for (const img of images) {
    const { image: base64Data, extension } = extractImageAndExtension(
      img.base64,
    );
    const filename = `${assetId}-${Date.now()}-${img.image_type}.${extension}`;

    const { success } = await saveBase64Image(
      base64Data,
      filename,
      "uploads/assets",
    );
    if (!success) continue;

    const record = await tx.assetImage.create({
      data: {
        asset_id: assetId,
        url: `uploads/assets/${filename}`,
        image_type: img.image_type,
        description: img.description?.trim(),
        uploaded_by: uploadedBy,
      },
    });

    savedImages.push(record);
  }

  return savedImages;
}

export const createAsset = async (
  data: z.infer<typeof assetCreateSchema>,
  createdBy: number,
) => {
  return prisma.$transaction(
    async (tx) => {
      const createdAssets: any[] = [];

      for (let i = 1; i <= data.quantity; i++) {
        const brand = data.brand?.trim() ?? "Generic";
        let serial: string;
        if (data.serial_number) {
          serial = `${data.serial_number.trim()}-${i.toString().padStart(3, "0")}`;
        } else {
          const typePrefix = data.type;
          const brandPrefix = data.brand;
          const randomPart = generateRandomHex(6).toUpperCase();
          serial = `${typePrefix}-${brandPrefix}-${randomPart}`;
        }

        const asset = await tx.asset.create({
          data: {
            type: data.type,
            serial_number: serial,
            model: data.model?.trim() ?? null,
            brand: brand,
            purchase_date: data.purchase_date,
            warranty_end: data.warranty_end,
            description: data.description?.trim() ?? null,
            status: data.status,
            created_by: createdBy,
          },
        });

        const images = await saveAndCreateImages(
          tx,
          asset.id,
          data.images,
          createdBy,
        );

        createdAssets.push({ ...asset, images });
      }

      return createdAssets;
    },
    { timeout: 30000 },
  );
};

export const updateAsset = async (
  assetId: number,
  data: z.infer<typeof assetUpdateSchema>,
  updatedBy: number,
) => {
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.asset.findUnique({
        where: { id: assetId, is_deleted: false },
      });
      if (!existing) throw new Error("Asset not found or deleted");

      if (data.remove_image_ids.length > 0) {
        await tx.assetImage.updateMany({
          where: {
            id: { in: data.remove_image_ids },
            asset_id: assetId,
          },
          data: { is_deleted: true },
        });
      }

      const addedImages = await saveAndCreateImages(
        tx,
        assetId,
        data.add_images,
        updatedBy,
      );

      const updated = await tx.asset.update({
        where: { id: assetId },
        data: {
          type: data.type,
          serial_number: data.serial_number?.trim(),
          model: data.model?.trim(),
          brand: data.brand?.trim(),
          purchase_date: data.purchase_date,
          warranty_end: data.warranty_end,
          description: data.description,
          status: data.status,
        },
      });

      return { ...updated, addedImages };
    },
    { timeout: 30000 },
  );
};

export const assignAsset = async (
  data: z.infer<typeof assetAssignSchema>,
  assignedBy: number,
) => {
  return prisma.$transaction(
    async (tx) => {
      const asset = await tx.asset.findUnique({
        where: { id: data.asset_id, is_deleted: false },
      });
      if (!asset) throw new Error("Asset not found or deleted");
      if (asset.status !== AssetStatus.available) {
        throw new Error(`Asset is currently ${asset.status}`);
      }

      const assignment = await tx.assetAssignment.create({
        data: {
          asset_id: data.asset_id,
          employee_id: data.employee_id,
          condition_on_assign: data.condition_on_assign?.trim(),
          notes: data.notes?.trim(),
          assigned_by: assignedBy,
        },
      });

      await tx.asset.update({
        where: { id: data.asset_id },
        data: { status: AssetStatus.assigned },
      });

      const images = await saveAndCreateImages(
        tx,
        data.asset_id,
        data.assignment_images,
        assignedBy,
      );

      return { ...assignment, images };
    },
    { timeout: 30000 },
  );
};

export const returnAsset = async (
  data: z.infer<typeof assetReturnSchema>,
  returnedBy: number,
) => {
  return prisma.$transaction(
    async (tx) => {
      const assignment = await tx.assetAssignment.findUnique({
        where: { id: data.assignment_id },
        include: { asset: true },
      });

      if (!assignment) throw new Error("Assignment not found");
      if (assignment.returned_at) throw new Error("Asset already returned");

      const updatedAssignment = await tx.assetAssignment.update({
        where: { id: data.assignment_id },
        data: {
          returned_at: new Date(),
          condition_on_return: data.condition_on_return?.trim(),
          notes: data.notes?.trim(),
          is_active: false,
        },
      });

      await tx.asset.update({
        where: { id: assignment.asset_id },
        data: { status: AssetStatus.available },
      });

      const images = await saveAndCreateImages(
        tx,
        assignment.asset_id,
        data.return_images,
        returnedBy,
      );

      return { ...updatedAssignment, images };
    },
    { timeout: 30000 },
  );
};

export const getAllAssets = async (
  filters: z.infer<typeof assetFilterSchema>,
) => {
  const {
    type,
    status,
    assigned_by,
    assigned_to,
    start_date,
    end_date,
    page = 1,
    limit = 100,
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = { is_deleted: false };

  if (type) where.type = type;
  if (status) where.status = status;
  if (start_date && end_date) {
    where.created_at = {
      gte: new Date(start_date),
      lt: new Date(
        new Date(end_date).setDate(new Date(end_date).getDate() + 1),
      ),
    };
  }
  if (assigned_by || assigned_to) {
    where.assignments = { some: {} };
    if (assigned_by) where.assignments.some.assigned_by = assigned_by;
    if (assigned_to) where.assignments.some.employee_id = assigned_to;
  }
  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      include: {
        images: {
          where: { is_deleted: false },
          select: { id: true, url: true, image_type: true, description: true },
          take: 3,
        },
        assignments: {
          where: { returned_at: null },
          select: {
            employee: { select: { id: true, full_name: true } },
            assigned_at: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.asset.count({ where }),
  ]);

  return {
    assets,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAssetById = async (assetId: number) => {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId, is_deleted: false },
    include: {
      creator: { select: { full_name: true } },
      images: {
        where: { is_deleted: false },
        orderBy: { uploaded_at: "desc" },
        select: {
          id: true,
          url: true,
          image_type: true,
          description: true,
          uploaded_at: true,
          uploader: { select: { full_name: true } },
        },
      },
      assignments: {
        orderBy: { assigned_at: "desc" },
        include: {
          employee: { select: { id: true, full_name: true, email: true } },
          assigner: { select: { full_name: true } },
        },
      },
      complaints: {
        orderBy: { requested_at: "desc" },
        select: {
          id: true,
          request_type: true,
          category: true,
          reason: true,
          status: true,
          requested_at: true,
        },
      },
    },
  });

  if (!asset) throw new Error("Asset not found or has been deleted");

  return asset;
};

export const getAssetHistory = async (assetId: number) => {
  const asset = await prisma.asset.findUnique({
    where: { id: assetId, is_deleted: false },
    select: {
      assignments: {
        orderBy: { assigned_at: "desc" },
        include: {
          employee: { select: { full_name: true } },
          assigner: { select: { full_name: true } },
        },
      },
      complaints: {
        orderBy: { requested_at: "desc" },
        include: {
          requested_by_employee: { select: { full_name: true } },
          reviewed_by_employee: { select: { full_name: true } },
        },
      },
    },
  });

  if (!asset) throw new Error("Asset not found or deleted");

  return asset;
};

export const getEmployeeAssets = async (employeeId: number) => {
  return prisma.assetAssignment.findMany({
    where: {
      employee_id: employeeId,
      returned_at: null,
      is_active: true,
    },
    include: {
      asset: {
        include: {
          images: {
            where: { is_deleted: false },
            take: 3,
            select: { id: true, url: true, image_type: true },
          },
        },
      },
      assigner: { select: { full_name: true } },
    },
    orderBy: { assigned_at: "desc" },
  });
};
