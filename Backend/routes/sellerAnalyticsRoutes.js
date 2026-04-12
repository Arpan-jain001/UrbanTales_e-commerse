import express from "express";
import sellerAuth from "../middlewares/sellerAuth.js";
import { stats } from "../controllers/sellerAnalyticsController.js";
import { salesChart } from "../controllers/sellerOrderController.js";
const router = express.Router();

router.get("/stats", sellerAuth, stats);
router.get("/salesChart", sellerAuth, salesChart);

export default router;
