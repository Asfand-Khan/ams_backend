import { Request, Response } from "express";
import { z } from "zod";
import { leaveListingSchema, leaveSchema, leaveSummarySchema, singleLeaveSchema } from "../validations/leaveValidations";
import { allLeaves, calculateDays, createLeave, leaveSummary, singleLeave } from "../services/leaveServices";

// Module --> Leave
// Method --> POST (Protected)
// Endpoint --> /api/v1/leaves
// Description --> Create Leaves
export const createLeaveHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = leaveSchema.parse(req.body);

    const leaveDays = calculateDays(parsedData.start_date, parsedData.end_date);

    const newLeave = await createLeave(parsedData, leaveDays);

    return res.status(201).json({
      status: 1,
      message: "Leave created successfully",
      payload: [newLeave],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Leave
// Method --> POST (Protected)
// Endpoint --> /api/v1/leaves/all
// Description --> Get Leaves
export const getAllLeavesHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = leaveListingSchema.parse(req.body);

    const leaves = await allLeaves(parsedData);

    return res.status(200).json({
      status: 1,
      message: "All Leaves fetched successfully",
      payload: leaves,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};

// Module --> Leave
// Method --> POST (Protected)
// Endpoint --> /api/v1/leaves/single
// Description --> Get Single Leave
export const getSingleLeaveHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = singleLeaveSchema.parse(req.body);

    const leave = await singleLeave(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Single Leave fetched successfully",
      payload: [leave],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};


// Module --> Leave
// Method --> POST (Protected)
// Endpoint --> /api/v1/summary
// Description --> Get leave summary
export const leaveSummaryHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = leaveSummarySchema.parse(req.body);

    const summary = await leaveSummary(parsedData.employee_id);

    return res.status(200).json({
      status: 1,
      message: "Leave summary fetched successfully",
      payload: summary,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        status: 0,
        message: error.errors[0].message,
        payload: [],
      });
    }

    return res.status(500).json({
      status: 0,
      message: error.message,
      payload: [],
    });
  }
};