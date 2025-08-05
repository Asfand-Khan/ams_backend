import { Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  createDesignation,
  getAllDesignations,
  getDesignationById,
  getDesignationByTitle,
  updateDesignation,
} from "../services/designationServices";
import {
  designationSchema,
  designationUpdateSchema,
} from "../validations/designationValidations";

// Module --> Designation
// Method --> GET (Protected)
// Endpoint --> /api/v1/designations
// Description --> Fetch all designations
export const getAllDesignationsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const designations = await getAllDesignations();
    return res.status(200).json({
      status: 1,
      message: "Designations fetched successfully",
      payload: designations,
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

// Module --> Designation
// Method --> POST (Protected)
// Endpoint --> /api/v1/designations
// Description --> Create Designations
export const createDesignationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = designationSchema.parse(req.body);

    const designationByTitle = await getDesignationByTitle(parsedData.title);

    if (designationByTitle) {
      return res.status(400).json({
        status: 0,
        message: "Designation with this title already exists",
        payload: [],
      });
    }

    const newDesignation = await createDesignation(parsedData);

    return res.status(201).json({
      status: 1,
      message: "Designation created successfully",
      payload: [newDesignation],
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

// Module --> Designation
// Method --> POST (Protected)
// Endpoint --> /api/v1/designations/single
// Description --> Get single designation
export const getSingleDesignationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const designationId = parseInt(req.body.id);

    if (isNaN(designationId) || designationId <= 0) {
      throw new Error("Invalid designation id or designation id can not be 0");
    }

    const singleDesignation = await getDesignationById(designationId);

    return res.status(200).json({
      status: 1,
      message: "Fetched single designation successfully",
      payload: [singleDesignation],
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

// Module --> Designation
// Method --> PUT (Protected)
// Endpoint --> /api/v1/designations/
// Description --> Update designation
export const updateDesignationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = designationUpdateSchema.parse(req.body);

    const updatedDesignation = await updateDesignation(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Designation updated successfully",
      payload: [updatedDesignation],
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
