import { Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  createOfficeWifiNetwork,
  getAllOfficeWifiNetworks,
  getOfficeWifiNetworkById,
  updateOfficeWifiNetwork,
} from "../services/officeWifiNetwork";
import { OfficeWifiNetworkSchema } from "../validations/wifiNetworkValidations";
import { z } from "zod";

// Update schema (partial - only required field is wifi_network_id)
const OfficeWifiNetworkUpdateSchema = z.object({
  wifi_network_id: z.number().int().positive("WiFi network ID is required"),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must not exceed 100 characters" })
    .optional(),
  password: z.string().max(255).nullable().optional(),
  notes: z.string().max(65535).nullable().optional(),
});

// Module --> Wifi Network
// Method --> GET (Protected)
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
// Description --> Create wifi network
export const createWifiNetworkHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = OfficeWifiNetworkSchema.parse(req.body);

    const newNetwork = await createOfficeWifiNetwork(parsedData);

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

// Module --> Wifi Network
// Method --> PUT (Protected)
// Endpoint --> /api/v1/wifi-networks
// Description --> Update wifi network
export const updateWifiNetworkHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = OfficeWifiNetworkUpdateSchema.parse(req.body);

    const updatedNetwork = await updateOfficeWifiNetwork({
      wifi_network_id: parsedData.wifi_network_id,
      name: parsedData.name,
      password: parsedData.password,
      notes: parsedData.notes,
    });

    return res.status(200).json({
      status: 1,
      message: "Wifi network updated successfully",
      payload: [updatedNetwork],
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
// Endpoint --> /api/v1/wifi-networks/single
// Description --> Get single wifi network by ID
export const getSingleWifiNetworkHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.body;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      throw new Error("Valid WiFi network ID is required");
    }

    const network = await getOfficeWifiNetworkById(Number(id));

    return res.status(200).json({
      status: 1,
      message: "Wifi network fetched successfully",
      payload: [network],
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