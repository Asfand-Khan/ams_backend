import prisma from "../config/db";
import {
  AllNotification,
  CreateNotification,
  SingleNotification,
} from "../validations/notificationValidations";
import { sendPushNotification } from "../utils/sendPushNotification";
import { sendEmail } from "../utils/sendEmail";
import { getNotificationTemplate } from "../utils/notificationTemplate";
import { format } from "date-fns-tz";

// export const createNotification = async (data: CreateNotification) => {
//   const { title, message, type, priority, user_id } = data;

//   // Save in DB
//   const notification = await prisma.notification.create({
//     data: {
//       title,
//       message,
//       type,
//       priority,
//       user: user_id ? { connect: { id: user_id } } : undefined,
//       broadcast: !user_id,
//     },
//   });

//   // Get FCM tokens
//   let tokens = [];
//   let users = [];

//   if (user_id) {
//     tokens = await prisma.fCMToken.findMany({
//       where: {
//         user_id: user_id,
//         is_active: true,
//       },
//     });

//     // Email for that specific user
//     const user = await prisma.user.findUnique({
//       where: { id: user_id },
//       select: {
//         email: true,
//         username: true,
//         employee: { select: { full_name: true } },
//       },
//     });

//     if (user) {
//       await sendEmail({
//         to: user.email,
//         subject: `Orio Connect - ${title}`,
//         html: getNotificationTemplate(
//           title,
//           type,
//           message,
//           priority,
//            format(new Date(notification.sent_at), "dd-MMMM-yyyy"),
//           new Date().getFullYear().toString()
//         ),
//       });
//     }
//   } else {
//     tokens = await prisma.fCMToken.findMany({
//       where: { is_active: true },
//     });

//     // Emails for all users
//     users = await prisma.user.findMany({
//       select: { email: true },
//     });

//     const emailArray = users.map((u) => u.email);
//     await sendEmail({
//       to: emailArray,
//       subject: `Orio Connect - ${title}`,
//       html: getNotificationTemplate(
//         title,
//         type,
//         message,
//         priority,
//         format(notification.sent_at, "yyyy-MM-dd HH:mm:ss"),
//         new Date().getFullYear().toString()
//       ),
//     });
//   }

//   const tokenList = tokens.map((t) => t.token);
//   await sendPushNotification(tokenList, title, message);

//   return notification;
// };

export const createNotification = async (data: CreateNotification) => {
  const { title, message, type, priority, user_id } = data;

  const userIds = Array.isArray(user_id) ? user_id : user_id ? [user_id] : [];

  // --- Users specified ---
  if (userIds.length > 0) {
    const notificationArray = userIds.map((id) => ({
      title,
      message,
      type,
      priority,
      user_id: id,
      broadcast: false,
    }));

    await prisma.notification.createMany({
      data: notificationArray,
    });

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        email: true,
        username: true,
        employee: { select: { full_name: true } },
      },
    });

    await Promise.all(
      users.map((user) => {
        const username = user.employee?.full_name ?? user.username ?? "User";
        return sendEmail({
          to: user.email,
          cc: ['bilal@getorio.com','asif@getorio.com','arslan.ali@getorio.com','imran@getorio.com'],
          subject: `Orio Connect - ${title}`,
          html: getNotificationTemplate(
            username,
            title,
            type,
            message,
            priority,
            format(new Date(), "dd-MMMM-yyyy"),
            new Date().getFullYear().toString()
          ),
        });
      })
    );

    // FCM tokens
    const tokens = await prisma.fCMToken.findMany({
      select: {
        token: true,
      },
      where: {
        user_id: {
          in: userIds,
        },
        is_active: true,
      },
    });

    await sendPushNotification(
      tokens.map((t) => t.token),
      title,
      message
    );
    return;
  }

  // --- Broadcast to all users ---
  const notification = await prisma.notification.create({
    data: { title, message, type, priority, broadcast: true },
  });

  const tokens = await prisma.fCMToken.findMany({ where: { is_active: true } });
  await sendPushNotification(
    tokens.map((t) => t.token),
    title,
    message
  );

  const users = await prisma.user.findMany({
    select: { email: true },
    where: { is_active: true },
  });
  
  await sendEmail({
    to: users.map((u) => u.email),
    cc: ['bilal@getorio.com','asif@getorio.com','arslan.ali@getorio.com','imran@getorio.com'],
    subject: `Orio Connect - ${title}`,
    html: getNotificationTemplate(
      "Orio Team",
      title,
      type,
      message,
      priority,
      format(new Date(notification.sent_at), "dd-MMMM-yyyy"),
      new Date().getFullYear().toString()
    ),
  });

  return;
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
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
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
