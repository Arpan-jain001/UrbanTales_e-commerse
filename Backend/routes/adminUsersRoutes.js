import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import {
  listUsersForAdmin,
  updateUserVerificationStatus,
  deleteUserForAdmin,
  resendUserVerificationEmail,
  resendVerificationToUnverifiedUsers,
} from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", adminAuth, superAdminOnly, listUsersForAdmin);
router.post("/reminders", adminAuth, superAdminOnly, resendVerificationToUnverifiedUsers);
router.post("/:id/resend-verification", adminAuth, superAdminOnly, resendUserVerificationEmail);
router.patch("/:id/verification", adminAuth, superAdminOnly, updateUserVerificationStatus);
router.delete("/:id", adminAuth, superAdminOnly, deleteUserForAdmin);

export default router;
