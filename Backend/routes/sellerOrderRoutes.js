import express from "express";
import sellerAuth from "../middlewares/sellerAuth.js";
import { listSellerOrders, updateOrderItemStatus } from "../controllers/sellerOrderController.js";
const router = express.Router();

router.get("/", sellerAuth, listSellerOrders);
router.put("/:orderId/item/:itemId/status", sellerAuth, updateOrderItemStatus);

export default router;
