import express from "express";
import {
  signup,
  login,
  updateProfile,
  googleFirebaseLogin,
} from "../controllers/User.Controller.js";

import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/UserProfile.Controller.js";

import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// Manual authentication
router.post("/signup", signup);
router.post("/login", login);

// Firebase Google authentication
router.post("/google-firebase", googleFirebaseLogin);

// ✅ OLD (keep – backward compatible)
router.put("/profile", verifyToken, updateProfile);

// ✅ NEW (recommended – clean)
router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

export default router;
