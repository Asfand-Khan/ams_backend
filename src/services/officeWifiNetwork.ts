import prisma from "../config/db";
import { OfficeWifiNetwork } from "../validations/wifiNetworkValidations";

export const getAllOfficeWifiNetworks = async () => {
  const allNetworks = await prisma.officeWifiNetwork.findMany({
    where: {
      is_deleted: false,
    },
  });
  return allNetworks;
};

export const createOfficeWifiNetworks = async (data: OfficeWifiNetwork) => {
  const newNetwork = await prisma.officeWifiNetwork.create({
    data: {
      name: data.name,
      notes: data.notes,
      password: data.password,
    },
  });
  return newNetwork;
};
