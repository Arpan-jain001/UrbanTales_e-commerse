import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

/* ================= USER FIREBASE ================= */

// Parse USER env
const userServiceAccount = JSON.parse(process.env.FIREBASE_KEY);

// Fix private key
userServiceAccount.private_key = userServiceAccount.private_key.replace(/\\n/g, "\n");

// Initialize USER app (default)
const userApp =
  getApps().find(app => app.name === "userApp") ||
  initializeApp(
    {
      credential: cert(userServiceAccount),
    },
    "userApp"
  );

export const adminAuth = getAuth(userApp);

/* ================= SELLER FIREBASE ================= */

// Parse SELLER env
const sellerServiceAccount = JSON.parse(process.env.SELLER_FIREBASE_KEY);

// Fix private key
sellerServiceAccount.private_key =
  sellerServiceAccount.private_key.replace(/\\n/g, "\n");

// Initialize SELLER app (separate app)
const sellerApp =
  getApps().find(app => app.name === "sellerApp") ||
  initializeApp(
    {
      credential: cert(sellerServiceAccount),
    },
    "sellerApp"
  );

export const sellerAuth = getAuth(sellerApp);