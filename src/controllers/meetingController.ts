import { NextFunction, Request, Response } from "express";
import { handleAppError } from "../utils/appErrorHandler";
import {
  attendMeetingSchema,
  meetingInstanceListSchema,
  meetingInstanceStatusSchema,
  meetingListSchema,
  meetingMinuteSchema,
  meetingSchema,
} from "../validations/meetingValidations";
import {
  attendMeeting,
  createMeeting,
  dashboardMeetingList,
  meetingInstanceListById,
  meetingList,
  meetingMinute,
  toggleMeetingInstanceStatus,
} from "../services/meetingServices";
import { AuthRequest } from "../types/types";

// Module --> Meeting
// Method --> GET (Protected)
// Endpoint --> /api/v1/meeting/
// Description --> Fetch meetings
export const dashboardMeetingListHandler = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Ensure user is attached by authentication middleware
    if (!req.userRecord) {
      return res.status(401).json({
        status: 0,
        message: "User not authenticated",
        payload: [],
      });
    }

    const meetings = await dashboardMeetingList(req.userRecord);

    return res.status(200).json({
      status: 1,
      message: "All Meetings successfully",
      payload: meetings,
    });
  } catch (error) {
    const err = handleAppError(error); // Assuming handleAppError is defined elsewhere
    return res.status(err.status).json({
      status: 0,
      message: err.message,
      payload: [],
    });
  }
};
// Module --> Meeting
// Method --> POST (Protected)
// Endpoint --> /api/v1/meetings/instances
// Description --> Fetch meeting instances by meeting ID
export const meetingInstanceListHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = meetingInstanceListSchema.parse(req.body);
    const instances = await meetingInstanceListById(parsedData);

    return res.status(200).json({
      status: 1,
      message: "All Meeting Instances successfully",
      payload: instances,
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

// Module --> Meeting
// Method --> POST (Protected)
// Endpoint --> /api/v1/meeting/all
// Description --> Fetch meetings
export const meetingListHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = meetingListSchema.parse(req.body);

    if (!parsedData.employee_id || !parsedData.end_date) {
      throw new Error("Employee ID and End Date are required");
    }

    const meetings = await meetingList(parsedData);

    return res.status(200).json({
      status: 1,
      message: "All Meetings successfully",
      payload: meetings,
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

// Module --> Meeting
// Method --> POST (Protected)
// Endpoint --> /api/v1/meeting
// Description --> Create meeting
export const createMeetingHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = meetingSchema.parse(req.body);

    const newMeeting = await createMeeting(parsedData);

    return res.status(201).json({
      status: 1,
      message: "Meeting created successfully",
      payload: [newMeeting],
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

// Module --> Meeting
// Method --> POST (Protected)
// Endpoint --> /api/v1/meeting/attend
// Description --> Attend a meeting
export const attendMeetingHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = attendMeetingSchema.parse(req.body);

    const updatedMeeting = await attendMeeting(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Meeting attended successfully",
      payload: [updatedMeeting],
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

// Module --> Meeting
// Method --> POST (Protected)
// Endpoint --> /api/v1/meeting/minutes
// Description --> Create meeting minutes
export const meetingMinutesHandler = async (
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

    const parsedData = meetingMinuteSchema.parse(req.body); // Assuming schema is defined
    const newMinutes = await meetingMinute(parsedData, req.userRecord.id);

    return res.status(201).json({
      status: 1,
      message: "Meeting minutes created successfully",
      payload: [newMinutes],
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


// Module --> Meeting 
// Method --> POST (Protected)
// Endpoint --> /api/v1/meeting/instance/status
// Description --> Toggle meeting instance status
export const meetingInstanceStatusHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = meetingInstanceStatusSchema.parse(req.body);
    const updatedInstance = await toggleMeetingInstanceStatus(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Updated Meeting Instance successfully",
      payload: [updatedInstance],
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