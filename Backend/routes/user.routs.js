import express from "express";
import {
  signup,
  login,
  updateProfile,
  googleFirebaseLogin,
  verifyAccount,
  resendVerification,
} from "../controllers/User.Controller.js";
import {
  getMyProfile,
  updateMyProfile,
} from "../controllers/UserProfile.Controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-account", verifyAccount);
router.post("/resend-verification", resendVerification);
router.post("/google-firebase", googleFirebaseLogin);
router.get("/profile", verifyToken, getMyProfile);
router.put("/profile", verifyToken, updateProfile);
router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

export default router;
