import { initializeApp, cert } from "firebase-admin/app";
import { readFileSync } from "fs";
import path from "path";
import admin from "firebase-admin";

const serviceAccountPath = path.resolve(__dirname, "../oams-firebase.json");
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf8"));

const app = !admin.apps.length
  ? initializeApp({
      credential: cert(serviceAccount),
    })
  : admin.app();

export const configuredFirebaseAdminApp = app;
export default admin;