import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { FIREBASE_CONFIG } from "../src/config/appConfig.js";

const app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
