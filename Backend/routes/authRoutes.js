// Backend/routes/authRoutes.js
import express from "express";
import {
  requestResetPassword,
  verifyResetOTP,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// Legacy /api/auth is retained only for password recovery.
// All active signup/login flows live under /api/users and /api/sellers/auth.
router.post("/reset-password/request", requestResetPassword);
router.post("/reset-password/verify", verifyResetOTP);
router.post("/reset-password/confirm", resetPassword);

export default router;
