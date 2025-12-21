// Backend/routes/authRoutes.js
import express from "express";
import {
  registerUser,
  loginUser,
  requestResetPassword,
  verifyResetOTP,
  resetPassword,
} from "../controllers/authController.js";
import { googleSellerAuth } from "../controllers/google.auth.controller.js";

const router = express.Router();

// AUTH ROUTES (USER)
router.post("/register", registerUser);      // POST /api/auth/register
router.post("/login", loginUser);            // POST /api/auth/login

// RESET PASSWORD ROUTES
router.post("/reset-password/request", requestResetPassword);
router.post("/reset-password/verify", verifyResetOTP);
router.post("/reset-password/confirm", resetPassword);

// GOOGLE SELLER AUTH
router.post("/google-seller", googleSellerAuth);

export default router;
