import express from "express";
import mongoose from "mongoose";
import Product from "../models/product.js";
import Order from "../models/Order.js";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";

const router = express.Router();

/**
 * Helper: build filter for future scope
 */
function buildProductFilter(query) {
  const { category, sellerId, search, status } = query;
  const filter = {};

  if (category) {
    filter.category = new RegExp(`^${category}$`, "i");
  }

  if (sellerId && mongoose.isValidObjectId(sellerId)) {
    filter.sellerId = sellerId;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  // future scope: status field (ACTIVE, INACTIVE, DELETED)
  if (status) {
    filter.status = status;
  }

  return filter;
}

/**
 * GET /api/admin/products
 * - Server-side pagination + filters
 * - Future ready for status, seller, category, search, sorting
 */
router.get("/", adminAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "-createdAt", // default newest first
    } = req.query;

    const filter = buildProductFilter(req.query);

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      products,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Admin get products error:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

/**
 * GET /api/admin/products/:id
 * - Single product detail + optional order stats (future scope)
 */
router.get("/:id", adminAuth, async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id).lean();
    if (!prod) return res.status(404).json({ message: "Product not found" });

    // Future: product-wise sales summary (optional, can use separate controller)
    // const stats = await Order.aggregate([...])

    res.status(200).json({
      product: prod,
      // stats,
    });
  } catch (err) {
    console.error("Admin get product error:", err);
    res.status(500).json({ message: "Failed to get product" });
  }
});

/**
 * PUT /api/admin/products/:id
 * - Admin can edit any seller's product
 * - Keeps history-ready structure: only whitelisted fields editable
 */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });

    const allowed = [
      "name",
      "category",
      "description",
      "price",
      "stock",
      "image",
      "images",
      "videos",
      "delivery",
      // future scope: "status"
    ];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        prod[field] = req.body[field];
      }
    });

    // For audit in future: lastModifiedByAdmin
    if (!prod.meta) prod.meta = {};
    prod.meta.lastModifiedByAdminId = req.admin._id;
    prod.meta.lastModifiedAt = new Date();

    await prod.save();
    res.status(200).json({
      message: "Product updated successfully",
      product: prod,
    });
  } catch (err) {
    console.error("Admin update product error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
});

/**
 * DELETE /api/admin/products/:id
 * - Super admin only
 * - Future-safe: mark order items as ProductDeleted so analytics/history safe rahe
 */
router.delete("/:id", adminAuth, superAdminOnly, async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id);
    if (!prod) return res.status(404).json({ message: "Product not found" });

    const productId = String(prod._id);

    // 1) Hard delete product
    await Product.findByIdAndDelete(productId);

    // 2) Mark related order items so future analytics me break na aaye
    await Order.updateMany(
      { "items.id": productId },
      {
        $set: {
          "items.$[elem].status": "ProductDeleted",
        },
      },
      {
        arrayFilters: [{ "elem.id": productId }],
      }
    );

    res.status(200).json({
      message: "Product deleted and related order items marked as ProductDeleted",
    });
  } catch (err) {
    console.error("Admin delete product error:", err);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
