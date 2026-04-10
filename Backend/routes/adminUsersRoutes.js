import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import {
  listUsersForAdmin,
  updateUserVerificationStatus,
  deleteUserForAdmin,
} from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", adminAuth, superAdminOnly, listUsersForAdmin);
router.patch("/:id/verification", adminAuth, superAdminOnly, updateUserVerificationStatus);
router.delete("/:id", adminAuth, superAdminOnly, deleteUserForAdmin);

export default router;
