// routes/adminStatsRoutes.js
import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import {
  getAdminOverviewStats,
  getAdminDailySales,
} from "../controllers/adminStatsController.js";

const router = express.Router();

router.get("/overview", adminAuth, superAdminOnly, getAdminOverviewStats);
router.get("/sales/daily", adminAuth, superAdminOnly, getAdminDailySales);

export default router;
