import express from "express";
import {
  adminLogin,
  createAdmin,
  requestAdminPasswordReset,
  verifyAdminOtp,
  resetAdminPassword,
  changeAdminPassword,
  listAdmins,
  deleteAdmin,
} from "../controllers/adminAuthController.js";
import {
  getAdminProfile,
  updateAdminProfile,
} from "../controllers/adminProfileController.js";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";

const router = express.Router();

// PUBLIC
router.post("/login", adminLogin);
router.post("/forgot-password", requestAdminPasswordReset);
router.post("/verify-otp", verifyAdminOtp);
router.post("/reset-password", resetAdminPassword);

// SUPER ADMIN – add admin
router.post("/create", adminAuth, superAdminOnly, createAdmin);

// SUPER ADMIN – list admins
router.get("/list", adminAuth, superAdminOnly, listAdmins);

// SUPER ADMIN – delete admin
router.delete("/delete/:adminId", adminAuth, superAdminOnly, deleteAdmin);

// PROFILE (protected)
router.get("/profile", adminAuth, getAdminProfile);
router.put("/profile", adminAuth, updateAdminProfile);
router.post("/change-password", adminAuth, changeAdminPassword);

export default router;
