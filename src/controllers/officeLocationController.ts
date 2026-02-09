import { Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  createOfficeLocation,
  getAllOfficeLocations,
  getOfficeLocationById,
  getOfficeLocationByLatitude,
  getOfficeLocationByLongitude,
  getOfficeLocationByName,
  updateOfficeLocation,
} from "../services/officeLocationServices";
import {
  officeLocationSchema,
  officeLocationUpdateSchema,
} from "../validations/officeLocationValidations";

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
// Description --> Create office location
export const createOfficeLocationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = officeLocationSchema.parse(req.body);

    const officeByName = await getOfficeLocationByName(parsedData.name);
    if (officeByName) {
      throw new Error("Office location with this name already exists");
    }

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

    const newLocation = await createOfficeLocation(parsedData);

    return res.status(201).json({
      status: 1,
      message: "Office location created successfully",
      payload: [newLocation],
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
// Method --> PUT (Protected)
// Endpoint --> /api/v1/office-locations
// Description --> Update office location
export const updateOfficeLocationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = officeLocationUpdateSchema.parse(req.body);

    const updatedLocation = await updateOfficeLocation(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Office location updated successfully",
      payload: [updatedLocation],
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
// Endpoint --> /api/v1/office-locations/single
// Description --> Get single office location by ID
export const getSingleOfficeLocationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.body;

    if (!id || isNaN(Number(id)) || Number(id) <= 0) {
      throw new Error("Valid office location ID is required");
    }

    const location = await getOfficeLocationById(Number(id));

    if (!location) {
      throw new Error("Office location not found");
    }

    if (location.is_deleted) {
      throw new Error("Office location has been deleted");
    }

    return res.status(200).json({
      status: 1,
      message: "Office location fetched successfully",
      payload: [location],
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