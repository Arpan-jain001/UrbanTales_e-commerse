import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateQtyInCart,
  clearCart,
} from "../controllers/Cart.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = express.Router();

// 🔐 Sare routes protected
router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.post("/remove", verifyToken, removeFromCart);
router.post("/update", verifyToken, updateQtyInCart);
router.post("/clear", verifyToken, clearCart);

export default router;
