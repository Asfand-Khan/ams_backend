import { Request, Response } from "express";
import { allMenus } from "../services/menuServices";
import { handleAppError } from "../utils/appErrorHandler";

// Module --> Menu
// Method --> GET (Protected)
// Endpoint --> /api/v1/menus
// Description --> Fetch all menus
export const getAllMenusHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const menus = await allMenus();
    return res.status(200).json({
      status: 1,
      message: "All menus fetched successfully",
      payload: menus,
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
