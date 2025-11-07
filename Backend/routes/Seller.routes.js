import express from "express";
import { signup, login } from "../controllers/sellerAuthController.js";
import sellerValidate from "../middlewares/sellerValidate.js";
import sellerAuth from "../middlewares/sellerAuth.js";
import Seller from "../models/Seller.js";

// --- Controllers for product and order dashboard ---
import * as sellerProduct from "../controllers/sellerProductController.js"; // Use correct path
import {
  listSellerOrders,
  updateOrderItemStatus,
  salesChart
} from "../controllers/sellerOrderController.js";

const router = express.Router();

// Seller Auth
router.post('/auth/signup', sellerValidate(["fullName", "email", "password"]), signup);
router.post('/auth/login', sellerValidate(["email", "password"]), login);

// Seller Profile
router.get('/profile', sellerAuth, async (req, res) => {
  try {
    res.json(req.seller);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put('/profile', sellerAuth, async (req, res) => {
  try {
    const { shopName, address, bio, phone } = req.body;
    const seller = await Seller.findById(req.seller._id);

    if (!seller) return res.status(404).json({ error: "Seller not found" });

    // Update only provided fields
    if (shopName !== undefined) seller.shopName = shopName;
    if (address !== undefined) seller.address = address;
    if (bio !== undefined) seller.bio = bio;
    if (phone !== undefined) seller.phone = phone;

    await seller.save();

    res.json({
      message: "Profile updated successfully",
      seller: {
        _id: seller._id,
        fullName: seller.fullName,
        username: seller.username,
        email: seller.email,
        phone: seller.phone,
        shopName: seller.shopName,
        address: seller.address,
        bio: seller.bio
      }
    });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// --- Seller's own product management ---
router.get("/products", sellerAuth, sellerProduct.list);
router.post("/products", sellerAuth, sellerProduct.add);
router.post("/products/with-stock", sellerAuth, sellerProduct.addProductWithStock);
router.get("/products/:id", sellerAuth, sellerProduct.getOne);
router.put("/products/:id", sellerAuth, sellerProduct.update);
router.delete("/products/:id", sellerAuth, sellerProduct.remove);

// --- Seller Dashboard Orders & Analytics ---
router.get("/orders", sellerAuth, listSellerOrders);
router.put("/orders/:orderId/item/:itemId/status", sellerAuth, updateOrderItemStatus);
router.get("/orders/analytics/salesChart", sellerAuth, salesChart);

export default router;
