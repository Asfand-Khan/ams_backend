import { Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  createShift,
  getAllShifts,
  getShiftById,
  getShiftByName,
  updateShift,
} from "../services/shiftService";
import {
  shiftSchema,
  shiftUpdateSchema,
} from "../validations/shiftValidations";

// Module --> Shift
// Method --> GET (Protected)
// Endpoint --> /api/v1/shifts
// Description --> Fetch all shifts
export const getAllShiftsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const shifts = await getAllShifts();
    return res.status(200).json({
      status: 1,
      message: "Shifts fetched successfully",
      payload: shifts,
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

// Module --> Shifts
// Method --> POST (Protected)
// Endpoint --> /api/v1/shifts
// Description --> Create Shift
export const createShiftHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = shiftSchema.parse(req.body);

    const shiftByName = await getShiftByName(parsedData.name);

    if (shiftByName) {
      return res.status(400).json({
        status: 0,
        message: "Shift with this name already exists",
        payload: [],
      });
    }

    const newShift = await createShift(parsedData);

    return res.status(201).json({
      status: 1,
      message: "Shift created successfully",
      payload: [newShift],
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

// Module --> Shifts
// Method --> POST (Protected)
// Endpoint --> /api/v1/shifts/single
// Description --> Get single shift
export const getSingleShiftHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const shiftId = parseInt(req.body.id);

    if (isNaN(shiftId) || shiftId <= 0) {
      throw new Error("Invalid shift id or shift id can not be 0");
    }

    const singleShift = await getShiftById(shiftId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single shift successfully",
      payload: [singleShift],
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

// Module --> Shift
// Method --> PUT (Protected)
// Endpoint --> /api/v1/shifts/
// Description --> Update shift
export const updateShiftHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = shiftUpdateSchema.parse(req.body);

    const updatedShift = await updateShift(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Shift updated successfully",
      payload: [updatedShift],
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
