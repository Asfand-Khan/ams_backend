import prisma from "../config/db";
import { Server as SocketIOServer } from "socket.io";
import { CreateNotification } from "../validations/notificationValidations";
import logger from "../config/logger";

export const createNotification = async (
  data: CreateNotification,
  io: SocketIOServer
) => {
  try {
    const notification = await prisma.notification.create({
      data,
    });
    if (data.user_id) {
      io.to(`user_${data.user_id}`).emit("notification", notification);
      logger.info(
        `Notification emitted to user_${data.user_id}: ${JSON.stringify(
          notification
        )}`
      );
    } else {
      io.emit("notification", notification);
      logger.info(
        `Notification broadcasted to all: ${JSON.stringify(notification)}`
      );
    }
    return notification;
  } catch (error) {
    logger.error(`Error in notification service: ${error}`);
    throw error;
  }
};
