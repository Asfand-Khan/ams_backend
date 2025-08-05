import { Request, Response } from "express";
import {
  createOfficeWifiNetworks,
  getAllOfficeWifiNetworks,
} from "../services/officeWifiNetwork";
import { handleAppError } from "../utils/appErrorHandler";
import { OfficeWifiNetworkSchema } from "../validations/wifiNetworkValidations";

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
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Wifi Network
// Method --> POST (Protected)
// Endpoint --> /api/v1/wifi-networks
// Description --> create wifi network
export const createWifiNetworkHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = OfficeWifiNetworkSchema.parse(req.body);

    const newNetwork = await createOfficeWifiNetworks(parsedData);
    return res.status(201).json({
      status: 1,
      message: "Wifi network created successfully",
      payload: [newNetwork],
    });
  } catch (error) {
    const err = handleAppError(error);
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
