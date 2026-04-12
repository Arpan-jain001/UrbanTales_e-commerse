import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import {
  listSellersForAdmin,
  updateSellerVerificationStatus,
  deleteSellerForAdmin,
  resendSellerVerificationEmail,
  resendVerificationToUnverifiedSellers,
} from "../controllers/adminSellerController.js";

const router = express.Router();

router.get("/", adminAuth, superAdminOnly, listSellersForAdmin);
router.post("/reminders", adminAuth, superAdminOnly, resendVerificationToUnverifiedSellers);
router.post("/:id/resend-verification", adminAuth, superAdminOnly, resendSellerVerificationEmail);
router.patch("/:id/verification", adminAuth, superAdminOnly, updateSellerVerificationStatus);
router.delete("/:id", adminAuth, superAdminOnly, deleteSellerForAdmin);

export default router;
