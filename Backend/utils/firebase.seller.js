import admin from "firebase-admin";

function parseServiceAccount(value) {
  if (!value) {
    throw new Error(
      "SELLER_FIREBASE_SERVICE_ACCOUNT_KEY is required. Checked-in seller Firebase key files are no longer used."
    );
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new Error(`SELLER_FIREBASE_SERVICE_ACCOUNT_KEY must contain valid JSON: ${error.message}`);
  }
}

const serviceAccount = parseServiceAccount(process.env.SELLER_FIREBASE_SERVICE_ACCOUNT_KEY);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.SELLER_FIREBASE_PROJECT_ID,
  });
}

export default admin;
