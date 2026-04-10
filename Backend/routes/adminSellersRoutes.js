import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import {
  listSellersForAdmin,
  updateSellerVerificationStatus,
  deleteSellerForAdmin,
} from "../controllers/adminSellerController.js";

const router = express.Router();

router.get("/", adminAuth, superAdminOnly, listSellersForAdmin);
router.patch("/:id/verification", adminAuth, superAdminOnly, updateSellerVerificationStatus);
router.delete("/:id", adminAuth, superAdminOnly, deleteSellerForAdmin);

export default router;
