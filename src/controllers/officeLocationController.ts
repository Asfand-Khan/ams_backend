import { Request, Response } from "express";
import {
  createOfficeLocation,
  getAllOfficeLocations,
  getOfficeLocationByLatitude,
  getOfficeLocationByLongitude,
  getOfficeLocationByName,
} from "../services/officeLocationServices";
import { handleAppError } from "../utils/appErrorHandler";
import { officeLocationSchema } from "../validations/officeLocationValidations";

// Module --> Office Locations
// Method --> GET (Protected)
// Endpoint --> /api/v1/office-locations
// Description --> Fetch all office locations
export const getAllOfficeLocationsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const locations = await getAllOfficeLocations();
    return res.status(200).json({
      status: 1,
      message: "Office locations fetched successfully",
      payload: locations,
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

// Module --> Office Locations
// Method --> POST (Protected)
// Endpoint --> /api/v1/office-locations
// Description --> create office location
export const createOfficeLocationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = officeLocationSchema.parse(req.body);

    const officeByLongitude = await getOfficeLocationByLongitude(
      parsedData.longitude
    );
    if (officeByLongitude) {
      throw new Error("Office location with this longitude already exists");
    }

    const officeByLatitude = await getOfficeLocationByLatitude(
      parsedData.latitude
    );
    if (officeByLatitude) {
      throw new Error("Office location with this latitude already exists");
    }

    const officeByName = await getOfficeLocationByName(parsedData.name);
    if (officeByName) {
      throw new Error("Office location with this name already exists");
    }

    const newLocation = await createOfficeLocation(parsedData);
    return res.status(201).json({
      status: 1,
      message: "Office locations created successfully",
      payload: newLocation,
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
