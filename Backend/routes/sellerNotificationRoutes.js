// routes/sellerNotificationRoutes.js
import express from "express";
import sellerAuth from "../middlewares/sellerAuth.js";
import Notification from "../models/Notification.js";
import Product from "../models/product.js";
import StockAlert from "../models/StockAlert.js";

const router = express.Router();

// POST broadcast
router.post("/broadcast", sellerAuth, async (req, res) => {
  try {
    const { title, message, link, category, objective } = req.body;

    if (!message || !title) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const notif = await Notification.create({
      userId: null,
      targetAudience: "USERS",
      senderType: "SELLER",
      senderId: req.seller._id,
      senderModel: "Seller",
      senderName: req.seller.shopName || req.seller.fullName || "Seller",
      title,
      message,
      link: link || null,
      category: category || "GENERAL",
      objective: objective || "general",
    });

    res.status(201).json({ message: "Notification broadcasted", notification: notif });
  } catch (err) {
    console.error("Seller broadcast error:", err);
    res.status(500).json({ message: "Failed to send notification" });
  }
});

router.get("/stock-requests", sellerAuth, async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.seller._id }).select(
      "_id name category subCategory image images stock"
    );
    const productIds = products.map((product) => product._id);

    if (!productIds.length) {
      return res.json({
        summary: {
          totalRequests: 0,
          activeRequests: 0,
          notifiedRequests: 0,
          requestedProducts: 0,
        },
        requests: [],
      });
    }

    const alerts = await StockAlert.find({ productId: { $in: productIds } })
      .populate("userId", "fullName email phone")
      .populate("productId", "name category subCategory image images stock")
      .sort({ createdAt: -1 })
      .lean();

    const requests = alerts
      .filter((alert) => alert.productId)
      .map((alert) => ({
        _id: alert._id,
        productId: alert.productId._id,
        productName: alert.productId.name,
        category: alert.productId.category,
        subCategory: alert.productId.subCategory,
        productImage:
          alert.productId.image || alert.productId.images?.[0] || "",
        stock: Number(alert.productId.stock || 0),
        active: Boolean(alert.active),
        variant: alert.variant || "",
        requestedAt: alert.createdAt,
        notifiedAt: alert.notifiedAt,
        user: {
          id: alert.userId?._id || null,
          fullName: alert.userId?.fullName || "",
          email: alert.userId?.email || "",
          phone: alert.userId?.phone || "",
        },
      }));

    return res.json({
      summary: {
        totalRequests: requests.length,
        activeRequests: requests.filter((item) => item.active).length,
        notifiedRequests: requests.filter((item) => item.notifiedAt).length,
        requestedProducts: new Set(
          requests.map((item) => String(item.productId))
        ).size,
      },
      requests,
    });
  } catch (err) {
    console.error("Get seller stock requests error:", err);
    return res.status(500).json({ message: "Failed to fetch stock requests." });
  }
});

// GET seller notifications (exclude soft deleted)
router.get("/", sellerAuth, async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const notifications = await Notification.find({
      $or: [
        { sellerId },
        { sellerId: null, targetAudience: "SELLERS" },
        { sellerId: null, targetAudience: "BOTH" },
      ],
      deletedBy: { $ne: sellerId } // ← Hide if seller deleted
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifications);
  } catch (err) {
    console.error("Get seller notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// POST mark as read
router.post("/mark-read", sellerAuth, async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { ids = [] } = req.body;

    await Notification.updateMany(
      {
        _id: { $in: ids },
        $or: [{ sellerId }, { sellerId: null }],
      },
      { $set: { isRead: true } }
    );

    res.json({ message: "Updated" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

// GET unread count
router.get("/unread-count", sellerAuth, async (req, res) => {
  try {
    const sellerId = req.seller._id;

    const count = await Notification.countDocuments({
      $or: [
        { sellerId },
        { sellerId: null, targetAudience: "SELLERS" },
        { sellerId: null, targetAudience: "BOTH" },
      ],
      isRead: false,
      deletedBy: { $ne: sellerId }
    });

    res.json({ count });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ message: "Failed to fetch count" });
  }
});

// DELETE (soft delete for seller)
router.delete("/:id", sellerAuth, async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { id } = req.params;

    const notif = await Notification.findById(id);

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Soft delete - add seller to deletedBy
    await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { deletedBy: sellerId } }
    );

    res.json({ message: "Notification hidden" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

export default router;
