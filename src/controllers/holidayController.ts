import { Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  holidaySchema,
  holidayUpdateSchema,
} from "../validations/holidayValidations";
import {
  createHoliday,
  getAllHolidays,
  getHolidayById,
  updateHoliday,
} from "../services/holidayServices";

// Module --> Holiday
// Method --> POST (Protected)
// Endpoint --> /api/v1/holidays
// Description --> Create Holidays
export const createHolidayHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = holidaySchema.parse(req.body);
    const newHoliday = await createHoliday(parsedData);

    return res.status(201).json({
      status: 1,
      message: "Holiday created successfully",
      payload: [newHoliday],
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

// Module --> Holiday
// Method --> GET (Protected)
// Endpoint --> /api/v1/holidays/
// Description --> Get Holidays
export const getAllHolidaysHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const allHolidays = await getAllHolidays();
    return res.status(200).json({
      status: 1,
      message: "All holidays fetched successfully",
      payload: allHolidays,
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

// Module --> Holiday
// Method --> POST (Protected)
// Endpoint --> /api/v1/holidays/single
// Description --> Get Single Holidays
export const getSingleHolidayHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const holidayId = parseInt(req.body.id);

    if (isNaN(holidayId) || holidayId <= 0) {
      throw new Error("Invalid holiday id or holiday id can not be 0");
    }

    const holiday = await getHolidayById(holidayId);

    return res.status(200).json({
      status: 1,
      message: "Single holiday fetched successfully",
      payload: [holiday],
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

// Module --> Holiday
// Method --> PUT (Protected)
// Endpoint --> /api/v1/holidays/
// Description --> Update Holiday
export const updateHolidayHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = holidayUpdateSchema.parse(req.body);
    const updatedHoliday = await updateHoliday(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Holiday updated successfully",
      payload: [updatedHoliday],
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
