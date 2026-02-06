import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { getMyProfile, updateMyProfile } from "../controllers/UserProfile.Controller.js";

const router = express.Router();

// NEW endpoints (no conflict with old updateProfile)
router.get("/me", verifyToken, getMyProfile);
router.put("/me", verifyToken, updateMyProfile);

export default router;
