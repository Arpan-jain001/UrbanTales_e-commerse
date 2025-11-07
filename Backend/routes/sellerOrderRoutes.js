import express from "express";
import sellerAuth from "../middlewares/sellerAuth.js";
import {
  listSellerOrders,
  updateOrderItemStatus,
  salesChart
} from "../controllers/sellerOrderController.js";

const router = express.Router();

// Seller sees only their product orders (dashboard list)
router.get("/", sellerAuth, listSellerOrders);

// Seller can update status for only their items in a specific order
router.put("/:orderId/item/:itemId/status", sellerAuth, updateOrderItemStatus);

// Seller dashboard analytics (earnings/sold per month)
router.get("/analytics/salesChart", sellerAuth, salesChart);

export default router;
