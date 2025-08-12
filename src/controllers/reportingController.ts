import { Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  getAttendanceDetail,
  getOverallAttendanceSummaryReport,
} from "../services/reportingServices";
import { overallAttendanceSummarySchema } from "../validations/reportingValidations";

// Module --> Reporting
// Method --> POST (Protected)
// Endpoint --> /api/v1/reporting/overall-attendance-summary
// Description --> Fetch attendance summary
export const overallAttendanceSummaryHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = overallAttendanceSummarySchema.parse(req.body);
    const summary = await getOverallAttendanceSummaryReport(parsedData);
    return res.status(200).json({
      status: 1,
      message: "Overall attendance summary fetched successfully",
      payload: summary,
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

// Module --> Reporting
// Method --> POST (Protected)
// Endpoint --> /api/v1/reporting/attendance-detail
// Description --> Fetch attendance detail
export const attendanceDetailHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = overallAttendanceSummarySchema.parse(req.body);
    const summary = await getAttendanceDetail(parsedData);
    return res.status(200).json({
      status: 1,
      message: "Attendance detail fetched successfully",
      payload: summary,
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
