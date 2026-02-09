import prisma from "../config/db";
import { OfficeWifiNetwork } from "../validations/wifiNetworkValidations";

export const getAllOfficeWifiNetworks = async () => {
  const allNetworks = await prisma.officeWifiNetwork.findMany({
    where: {
      is_deleted: false,
    },
    orderBy: {
      created_at: "desc",
    },
  });
  return allNetworks;
};

export const createOfficeWifiNetwork = async (data: OfficeWifiNetwork) => {
  // Case-insensitive duplicate check (works on most databases)
  const existing = await prisma.officeWifiNetwork.findFirst({
    where: {
      name: data.name.trim(),
      is_deleted: false,
    },
  });

  if (existing && existing.name.toLowerCase() === data.name.trim().toLowerCase()) {
    throw new Error("WiFi network with this name already exists");
  }

  const newNetwork = await prisma.officeWifiNetwork.create({
    data: {
      name: data.name.trim(),
      password: data.password || null,
      notes: data.notes || null,
    },
  });

  return newNetwork;
};

export const updateOfficeWifiNetwork = async (data: {
  wifi_network_id: number;
  name?: string;
  password?: string | null;
  notes?: string | null;
}) => {
  const existing = await prisma.officeWifiNetwork.findUnique({
    where: { id: data.wifi_network_id },
  });

  if (!existing || existing.is_deleted) {
    throw new Error("WiFi network not found or has been deleted");
  }

  // If name is being changed → check for conflict (case-insensitive)
  if (data.name) {
    const trimmedName = data.name.trim();
    const nameConflict = await prisma.officeWifiNetwork.findFirst({
      where: {
        name: trimmedName,
        id: { not: data.wifi_network_id },
        is_deleted: false,
      },
    });

    if (nameConflict && nameConflict.name.toLowerCase() === trimmedName.toLowerCase()) {
      throw new Error("Another WiFi network with this name already exists");
    }
  }

  const updatedNetwork = await prisma.officeWifiNetwork.update({
    where: { id: data.wifi_network_id },
    data: {
      name: data.name ? data.name.trim() : existing.name,
      password: data.password !== undefined ? data.password : existing.password,
      notes: data.notes !== undefined ? data.notes : existing.notes,
    },
  });

  return updatedNetwork;
};

export const getOfficeWifiNetworkById = async (id: number) => {
  const network = await prisma.officeWifiNetwork.findUnique({
    where: { id },
  });

  if (!network || network.is_deleted) {
    throw new Error("WiFi network not found or has been deleted");
  }

  return network;
};