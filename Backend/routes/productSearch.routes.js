import express from "express";
import Product from "../models/product.js";

const router = express.Router();

// ✅ GET /api/products/search?q=...
router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.status(200).json([]);

    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (e) {
    console.error("Search error:", e);
    res.status(500).json({ message: "Cannot search products" });
  }
});

export default router;
