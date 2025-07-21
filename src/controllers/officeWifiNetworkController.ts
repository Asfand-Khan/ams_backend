import { Request, Response } from "express";
import { getAllOfficeWifiNetworks } from "../services/officeWifiNetwork";

// Module --> Wifi Network
// Method --> POST (Protected)
// Endpoint --> /api/v1/wifi-networks/all
// Description --> Get All Wifi Networks
export const getAllWifiNetworksHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const networks = await getAllOfficeWifiNetworks();

    return res.status(200).json({
      status: 1,
      message: "Wifi networks fetched successfully",
      payload: networks,
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};
