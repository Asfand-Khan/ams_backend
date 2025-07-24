import admin from "firebase-admin";
import * as serviceAccount from "../oams-firebase.json";

const app = !admin.apps.length
  ? admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    })
  : admin.app();

export const configuredFirebaseAdminApp = app; // ✅ Export App instance
export default admin;