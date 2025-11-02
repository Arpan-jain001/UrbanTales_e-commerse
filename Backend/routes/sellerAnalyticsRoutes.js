import express from "express";
import sellerAuth from "../middlewares/sellerAuth.js";
import { stats } from "../controllers/sellerAnalyticsController.js";
const router = express.Router();

router.get('/stats', sellerAuth, stats);

export default router;
