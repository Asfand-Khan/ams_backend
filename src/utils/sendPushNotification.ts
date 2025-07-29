import { getMessaging } from "firebase-admin/messaging";
import { configuredFirebaseAdminApp } from "./firebaseAdmin";

export const sendPushNotification = async (
  tokens: string[],
  title: string,
  message: string
) => {
  if (!tokens.length) return;

  const payload = {
    notification: {
      title,
      body: message,
    },
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
    },
  };

  try {
    const messaging = getMessaging(configuredFirebaseAdminApp);
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: payload.notification,
      data: payload.data,
    });

    console.log("✅ Push Notification Response", {
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.responses
        .filter((r) => !r.success)
        .map((r) => r.error?.message),
    });
  } catch (error) {
    console.error("❌ Error sending push notification", error);
  }
};
