import prisma from "../config/db";
import { Server as SocketIOServer } from "socket.io";
import {
  AllNotification,
  CreateNotification,
  SingleNotification,
} from "../validations/notificationValidations";
import logger from "../config/logger";
import { sendPushNotification } from "../utils/sendPushNotification";

export const createNotification = async (data: CreateNotification) => {
  try {
    const { title, message, type, priority, user_id } = data;

    // Save in DB
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        priority,
        user: user_id ? { connect: { id: user_id } } : undefined,
        broadcast: !user_id,
      },
    });

    // Get FCM tokens
    let tokens = [];
    if (user_id) {
      tokens = await prisma.fCMToken.findMany({
        where: {
          user_id: user_id,
          is_active: true,
        },
      });
    } else {
      tokens = await prisma.fCMToken.findMany({
        where: { is_active: true },
      });
    }

    const tokenList = tokens.map((t) => t.token);
    await sendPushNotification(tokenList, title, message);

    return notification;
  } catch (error) {
    logger.error(`Error in notification service: ${error}`);
    throw error;
  }
};

export const allNotifications = async (data: AllNotification) => {
  try {
    let notifications = [];
    if (data.employee_id) {
      notifications = await prisma.$transaction(async (tx) => {
        const user = await tx.user.findFirst({
          where: { employee_id: data.employee_id },
        });

        const notifications = await tx.notification.findMany({
          where: {
            user_id: user?.id,
          },
        });
        return notifications;
      });
    } else {
      notifications = await prisma.notification.findMany();
    }
    return notifications;
  } catch (error) {
    logger.error(`Error in fetching notifications : ${error}`);
    throw error;
  }
};

export const singleNotification = async (data: SingleNotification) => {
  try {
    const notification = await prisma.notification.update({
      where: {
        id: data.notification_id,
      },
      data: {
        status: "read",
      },
    });
    return notification;
  } catch (error) {
    logger.error(`Error in fetching single notification : ${error}`);
    throw error;
  }
};
