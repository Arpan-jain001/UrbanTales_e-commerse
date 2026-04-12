const readEnv = (key, fallback = "") => {
  const value = import.meta.env[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

export const API_BASE_URL = readEnv("VITE_BACKEND_API_URL", "http://localhost:3000").replace(
  /\/+$/,
  ""
);

export const FIREBASE_CONFIG = {
  apiKey: readEnv("VITE_FIREBASE_APIKEY"),
  authDomain: readEnv("VITE_FIREBASE_AUTH_DOMAIN",),
  projectId: readEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("VITE_FIREBASE_APP_ID"),
};

export const SELLER_FIREBASE_CONFIG = {
  apiKey: readEnv("VITE_SELLER_FIREBASE_APIKEY"),
  authDomain: readEnv("VITE_SELLER_FIREBASE_AUTH_DOMAIN"),
  projectId: readEnv("VITE_SELLER_FIREBASE_PROJECT_ID"),
  storageBucket: readEnv("VITE_SELLER_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: readEnv("VITE_SELLER_FIREBASE_MESSAGING_SENDER_ID"),
  appId: readEnv("VITE_SELLER_FIREBASE_APP_ID"),
  measurementId: readEnv("VITE_SELLER_FIREBASE_MEASUREMENT_ID"),
};
