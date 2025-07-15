import prisma from "../config/db";

export const getAllOfficeWifiNetworks = async () => {
  try {
    const allNetworks = await prisma.officeWifiNetwork.findMany({
      where: {
        is_deleted: false,
      },
    });
    return allNetworks;
  } catch (error: any) {
    throw new Error(`Failed to fetch all networks: ${error.message}`);
  }
};