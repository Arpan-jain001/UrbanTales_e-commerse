import express from "express";
import {
  signup,
  login,
  requestPasswordReset,
  resetPasswordWithOtp,
  verifyOtp,
  googleSellerAuth,
  verifyAccount,
  resendVerification,
} from "../controllers/sellerAuthController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-account", verifyAccount);
router.post("/resend-verification", resendVerification);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPasswordWithOtp);
router.post("/verify-otp", verifyOtp);
router.post("/google-login", googleSellerAuth);

export default router;
