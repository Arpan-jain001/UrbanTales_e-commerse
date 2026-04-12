import StockAlert from "../models/StockAlert.js";
import Product from "../models/product.js";
import Notification from "../models/Notification.js";

export const requestStockAlert = async (req, res) => {
  try {
    const { productId, variant = "" } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId).select("name image images stock");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock > 0) {
      return res.status(400).json({ message: "This product is already in stock" });
    }

    const existing = await StockAlert.findOne({ userId: req.userId, productId });
    if (existing && existing.active) {
      return res.status(200).json({ message: "You are already subscribed for this product" });
    }

    if (existing) {
      existing.active = true;
      existing.notifiedAt = null;
      existing.variant = variant;
      await existing.save();
    } else {
      await StockAlert.create({ userId: req.userId, productId, variant });
    }

    return res.status(201).json({ message: "Stock alert enabled. We will notify you when the product is back." });
  } catch (err) {
    console.error("Request stock alert error:", err);
    return res.status(500).json({ message: "Failed to request stock alert" });
  }
};

export const getStockAlerts = async (req, res) => {
  try {
    const alerts = await StockAlert.find({ userId: req.userId, active: true }).populate({
      path: "productId",
      select: "name category image images stock",
    });
    return res.status(200).json({ alerts });
  } catch (err) {
    console.error("Get stock alerts error:", err);
    return res.status(500).json({ message: "Failed to fetch stock alerts" });
  }
};

export const removeStockAlert = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    await StockAlert.deleteOne({ userId: req.userId, productId });
    return res.status(200).json({ message: "Stock alert removed" });
  } catch (err) {
    console.error("Remove stock alert error:", err);
    return res.status(500).json({ message: "Failed to remove stock alert" });
  }
};

export const notifyStockSubscribers = async (product) => {
  try {
    const alerts = await StockAlert.find({ productId: product._id, active: true }).populate("userId", "_id email");
    if (!alerts.length) return;

    const now = new Date();
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

    const notifications = alerts.map((alert) => ({
      userId: alert.userId._id,
      senderType: "SYSTEM",
      senderName: "UrbanTales",
      title: `${product.name} is back in stock!`,
      message: `The product you wanted is now available again. Tap to buy before it sells out.`,
      category: "ALERT",
      objective: "product",
      link: `${frontendUrl}/product/${product._id}`,
      image: product.image || (product.images && product.images[0]) || "",
      productId: product._id,
      isRead: false,
    }));

    await Notification.insertMany(notifications);
    await StockAlert.updateMany(
      { _id: { $in: alerts.map((item) => item._id) } },
      { active: false, notifiedAt: now }
    );
  } catch (err) {
    console.error("Stock subscriber notification error:", err);
  }
};
