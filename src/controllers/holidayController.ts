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

// POST /api/v1/holidays
export const createHolidayHandler = async (req: Request, res: Response) => {
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

// GET /api/v1/holidays
export const getAllHolidaysHandler = async (req: Request, res: Response) => {
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

// GET /api/v1/holidays/:id
export const getHolidayByIdHandler = async (req: Request, res: Response) => {
  try {
    const holidayId = parseInt(req.params.id);

    if (isNaN(holidayId) || holidayId <= 0) {
      throw new Error("Invalid holiday id");
    }

    const holiday = await getHolidayById(holidayId);

    if (!holiday) {
      return res.status(404).json({
        status: 0,
        message: "Holiday not found",
        payload: [],
      });
    }

    return res.status(200).json({
      status: 1,
      message: "Holiday fetched successfully",
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

// PUT /api/v1/holidays/:id
export const updateHolidayHandler = async (req: Request, res: Response) => {
  try {
    const holidayId = parseInt(req.params.id);

    if (isNaN(holidayId) || holidayId <= 0) {
      throw new Error("Invalid holiday id");
    }

    const parsedData = holidayUpdateSchema.parse({
      ...req.body,
      holiday_id: holidayId,
    });

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

