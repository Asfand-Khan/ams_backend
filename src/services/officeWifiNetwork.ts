import prisma from "../config/db";

export const getAllOfficeWifiNetworks = async () => {
  const allNetworks = await prisma.officeWifiNetwork.findMany({
    where: {
      is_deleted: false,
    },
  });
  return allNetworks;
};
