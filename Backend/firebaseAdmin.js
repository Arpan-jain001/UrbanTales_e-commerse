import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import dotenv from "dotenv";

dotenv.config();

// Parse env
const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

// 🔥 FIX: replace \\n → \n
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount),
});

export const adminAuth = getAuth();