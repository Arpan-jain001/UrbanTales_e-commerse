import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const serviceAccount = require("../serviceAccount.seller.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.SELLER_FIREBASE_PROJECT_ID,
  });
}

export default admin;
