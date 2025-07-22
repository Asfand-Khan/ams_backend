import { Request, Response } from "express";
import { z } from "zod";
import { createNotificationSchema } from "../validations/notificationValidations";
import { createNotification } from "../services/notificationServices";
import { io } from "../server";

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

    const notification = await createNotification(parsedData, io);

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
