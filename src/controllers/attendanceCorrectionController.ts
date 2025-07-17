import z from "zod";
import { Request, Response } from "express";
import {
  attendanceCorrectionCreateSchema,
  attendanceCorrectionListingSchema,
  singleAttendanceCorrectionSchema,
} from "../validations/atttendanceCorrectionValidations";
import { singleAttendance } from "../services/attendanceServices";
import {
  attendanceCorrectionListing,
  attendanceCorrectionSingle,
  createAttendanceCorrection,
} from "../services/attendanceCorrectionServices";

// Module --> Attendance Correction
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendance-correction
// Description --> Create Attendance Correction
export const createAttendanceCorrectionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendanceCorrectionCreateSchema.parse(req.body);

    if (
      (parsedData.requested_check_in_time == null || parsedData.requested_check_in_time == undefined) &&
      (parsedData.requested_check_out_time == null || parsedData.requested_check_out_time == undefined)
    ) {
      throw new Error(
        "Requested check in and requested check out can not be null at the same time, one should atleast be provided."
      );
    }

    const attendance = await singleAttendance(
      parsedData.employee_id,
      parsedData.attendance_date
    );

    const correction = await createAttendanceCorrection(parsedData, attendance);

    return res.status(201).json({
      status: 1,
      message: "Attendance correction created successfully",
      payload: [correction],
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

// Module --> Attendance Correction
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendance-correction/all
// Description --> Get All Attendance Correction
export const getAllAttendanceCorrectionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendanceCorrectionListingSchema.parse(req.body);

    const correctionListing = await attendanceCorrectionListing(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Attendance correction fetched successfully",
      payload: correctionListing,
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

// Module --> Attendance Correction
// Method --> POST (Protected)
// Endpoint --> /api/v1/attendance-correction/single
// Description --> Get Single Attendance Correction
export const getSingleAttendanceCorrectionHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = singleAttendanceCorrectionSchema.parse(req.body);

    const correctionSingle = await attendanceCorrectionSingle(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Single attendance correction fetched successfully",
      payload: [correctionSingle],
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
