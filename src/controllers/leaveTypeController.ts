import { Request, Response } from "express";
import * as service from "../services/leaveTypeServices";
import { leaveTypeSchema } from "../validations/leaveTypeValidations";
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
    const id = parseInt(req.params.id);
    const parsed = leaveTypeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({
        status: 0,
        message: parsed.error.errors[0]?.message || "Validation failed",
        payload: [],
      });
    }

    const type = await service.updateLeaveType(id, parsed.data);
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
