import prisma from "../config/db";
import {
  AllNotification,
  CreateNotification,
  SingleNotification,
} from "../validations/notificationValidations";
import { sendPushNotification } from "../utils/sendPushNotification";

export const createNotification = async (data: CreateNotification) => {
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
};

export const allNotifications = async (data: AllNotification) => {
  let notifications = [];
  if (data.employee_id) {
    notifications = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findFirst({
        where: { employee_id: data.employee_id },
      });

      const notifications = await tx.notification.findMany({
        where: {
          OR: [{ user_id: null }, { user_id: user?.id }],
        },
        orderBy: { created_at: "desc" },
      });

      return notifications;
    });
  } else {
    notifications = await prisma.notification.findMany({
      orderBy: { created_at: "desc" },
    });
  }
  return notifications;
};

export const singleNotification = async (data: SingleNotification) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: data.notification_id,
    },
  });
  return notification;
};