import { Request, Response } from "express";
import * as service from "../services/leaveTypeServices";
import {
  leaveTypeSchema,
  leaveTypeUpdateSchema,
} from "../validations/leaveTypeValidations";
import { handleAppError } from "../utils/appErrorHandler";

export const getAll = async (req: Request, res: Response) => {
  try {
    const types = await service.getLeaveTypes();
    return res.status(200).json({
      status: 1,
      message: "Leave types fetched successfully",
      payload: types,
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

export const create = async (req: Request, res: Response) => {
  try {
    const parsed = leaveTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        status: 0,
        message: parsed.error.errors[0]?.message || "Validation failed",
        payload: [],
      });
    }

    const type = await service.createLeaveType(parsed.data);
    return res.status(201).json({
      status: 1,
      message: "Leave type created successfully",
      payload: type,
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

export const update = async (req: Request, res: Response) => {
  try {
    const parsed = leaveTypeUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        status: 0,
        message: parsed.error.errors[0]?.message || "Validation failed",
        payload: [],
      });
    }
    const type = await service.updateLeaveType(parsed.data);
    return res.status(200).json({
      status: 1,
      message: "Leave type updated successfully",
      payload: type,
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

export const remove = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    await service.deleteLeaveType(id);

    return res.status(200).json({
      status: 1,
      message: "Leave type deleted successfully",
      payload: [],
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

export const single = async (req: Request, res: Response): Promise<any> => {
  try {
    const leaveTypeId = parseInt(req.body.id);

    if (isNaN(leaveTypeId) || leaveTypeId <= 0) {
      throw new Error("Invalid leave type id or leave type id can not be 0");
    }

    const singleLeaveType = await service.singleLeaveTypeById(leaveTypeId);

    return res.status(200).json({
      status: 1,
      message: "Single leave type fetched successfully",
      payload: [singleLeaveType],
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
