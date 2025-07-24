import { Request, Response } from "express";
import { z } from "zod";
import {
  allNotificationSchema,
  createNotificationSchema,
  singleNotificationSchema,
} from "../validations/notificationValidations";
import {
  allNotifications,
  createNotification,
  singleNotification,
} from "../services/notificationServices";
import { getUserByEmployeeId } from "../services/authServices";

// Module --> Notifications
// Method --> POST (Protected)
// Endpoint --> /api/v1/notifications/add
// Description --> Create a new notification
export const createNotificationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = createNotificationSchema.parse(req.body);

    const notification = await createNotification(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Notification created successfully",
      payload: [notification],
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

// Module --> Notifications
// Method --> POST (Protected)
// Endpoint --> /api/v1/notifications/all
// Description --> List of notification
export const getAllNotificationsHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = allNotificationSchema.parse(req.body);

    const notification = await allNotifications(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Notifications fetched successfully",
      payload: [notification],
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

// Module --> Notifications
// Method --> POST (Protected)
// Endpoint --> /api/v1/notifications/single
// Description --> Single notification
export const getSingleNotificationHandler = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const parsedData = singleNotificationSchema.parse(req.body);

    const notification = await singleNotification(parsedData);

    return res.status(200).json({
      status: 1,
      message: "Single notification fetched successfully",
      payload: [notification],
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