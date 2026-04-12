import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  requestStockAlert,
  getStockAlerts,
  removeStockAlert,
} from "../controllers/stockAlertController.js";

const router = express.Router();

router.post("/", verifyToken, requestStockAlert);
router.get("/", verifyToken, getStockAlerts);
router.delete("/:productId", verifyToken, removeStockAlert);

export default router;
