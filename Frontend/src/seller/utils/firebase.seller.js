import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { SELLER_FIREBASE_CONFIG } from "../../config/appConfig.js";

const firebaseSellerApp = getApps().some((app) => app.name === "sellerApp")
  ? getApp("sellerApp")
  : initializeApp(SELLER_FIREBASE_CONFIG, "sellerApp");

export const sellerAuth = getAuth(firebaseSellerApp);
export const sellerProvider = new GoogleAuthProvider();
