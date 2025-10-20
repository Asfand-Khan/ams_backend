import { NextFunction, Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  getAttendanceDetail,
  getOverallAttendanceSummaryReport,
} from "../services/reportingServices";
import { overallAttendanceSummarySchema } from "../validations/reportingValidations";
import { AuthRequest } from "../types/types";

// Module --> Reporting
// Method --> POST (Protected)
// Endpoint --> /api/v1/reporting/overall-attendance-summary
// Description --> Fetch attendance summary
export const overallAttendanceSummaryHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Ensure user is authenticated
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }

    const parsedData = overallAttendanceSummarySchema.parse(req.body); // Assuming schema is defined
    const summary = await getOverallAttendanceSummaryReport(
      parsedData,
      req.userRecord
    );
    return res.status(200).json({
      status: 1,
      message: "Overall attendance summary fetched successfully",
      payload: summary,
    });
  } catch (error) {
    const err = handleAppError(error); // Assuming handleAppError is defined
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};

// Module --> Reporting
// Method --> POST (Protected)
// Endpoint --> /api/v1/reporting/attendance-detail
// Description --> Fetch attendance detail
export const attendanceDetailHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Ensure user is authenticated
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }

    const parsedData = overallAttendanceSummarySchema.parse(req.body); // Assuming schema is defined
    const summary = await getAttendanceDetail(parsedData, req.userRecord);
    return res.status(200).json({
      status: 1,
      message: "Attendance detail fetched successfully",
      payload: summary,
    });
  } catch (error) {
    const err = handleAppError(error); // Assuming handleAppError is defined
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
