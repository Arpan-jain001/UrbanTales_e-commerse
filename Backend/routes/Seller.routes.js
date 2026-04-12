import express from "express";
import sellerAuth from "../middlewares/sellerAuth.js";
import Seller from "../models/Seller.js";
import * as sellerProduct from "../controllers/sellerProductController.js";
import {
  listSellerOrders,
  updateOrderItemStatus,
  salesChart,
} from "../controllers/sellerOrderController.js";

const router = express.Router();

const serializeSeller = (seller) => ({
  _id: seller._id,
  fullName: seller.fullName,
  username: seller.username,
  email: seller.email,
  phone: seller.phone,
  shopName: seller.shopName,
  address: seller.address,
  bio: seller.bio,
  avatar: seller.avatar,
  isVerified: Boolean(seller.isVerified),
});

// GET current seller
router.get("/me", sellerAuth, async (req, res) => {
  try {
    res.json(serializeSeller(req.seller));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// SAME LOGIC for /profile
router.get("/profile", sellerAuth, async (req, res) => {
  try {
    res.json(serializeSeller(req.seller));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.put("/profile", sellerAuth, async (req, res) => {
  try {
    const { shopName, address, bio, phone, avatar } = req.body;
    const seller = await Seller.findById(req.seller._id);

    if (!seller) return res.status(404).json({ error: "Seller not found" });

    if (shopName !== undefined) seller.shopName = shopName;
    if (address !== undefined) seller.address = address;
    if (bio !== undefined) seller.bio = bio;
    if (phone !== undefined) seller.phone = phone;
    if (avatar !== undefined) seller.avatar = avatar;

    await seller.save();
    res.json(serializeSeller(seller));
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/products", sellerAuth, sellerProduct.list);
router.post("/products", sellerAuth, sellerProduct.add);
router.post("/products/with-stock", sellerAuth, sellerProduct.addProductWithStock);
router.get("/products/:id", sellerAuth, sellerProduct.getOne);
router.put("/products/:id", sellerAuth, sellerProduct.update);
router.delete("/products/:id", sellerAuth, sellerProduct.remove);

router.get("/orders", sellerAuth, listSellerOrders);
router.put("/orders/:orderId/item/:itemId/status", sellerAuth, updateOrderItemStatus);
router.get("/orders/analytics/salesChart", sellerAuth, salesChart);

export default router;
