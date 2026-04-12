import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

// Read JSON file manually
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./serviceAccountKey.json", import.meta.url))
);

// Initialize Firebase
initializeApp({
  credential: cert(serviceAccount),
});

// Export auth
export const adminAuth = getAuth();