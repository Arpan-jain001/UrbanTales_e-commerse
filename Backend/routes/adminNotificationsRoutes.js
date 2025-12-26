// routes/adminNotificationsRoutes.js
import express from "express";
import { adminAuth } from "../middlewares/adminAuth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// POST broadcast
router.post("/broadcast", adminAuth, async (req, res) => {
  const { title, message, link, category, objective, userId, sellerId, targetAudience } = req.body;

  if (!title || !message) {
    return res.status(400).json({ message: "Title and message required" });
  }

  try {
    const notif = await Notification.create({
      userId: userId || null,
      sellerId: sellerId || null,
      targetAudience: targetAudience || "USERS",
      senderType: "ADMIN",
      senderId: req.admin._id,
      senderModel: "Admin",
      senderName: req.admin.fullName || "Admin",
      title,
      message,
      link: link || null,
      category: category || "SYSTEM",
      objective: objective || "general",
    });

    res.status(201).json({ message: "Notification created", notification: notif });
  } catch (err) {
    console.error("Admin broadcast error:", err);
    res.status(500).json({ message: "Failed to create notification" });
  }
});

// GET all notifications for admin (sees everything)
router.get("/", adminAuth, async (req, res) => {
  try {
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(notifications);
  } catch (err) {
    console.error("Get admin notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// POST mark as read
router.post("/mark-read", adminAuth, async (req, res) => {
  try {
    const { ids = [] } = req.body;

    await Notification.updateMany(
      { _id: { $in: ids } },
      { $set: { isRead: true } }
    );

    res.json({ message: "Updated" });
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

// DELETE - ADMIN HARD DELETE (permanently removes from DB)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const notif = await Notification.findById(id);

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // HARD DELETE - Permanently remove from database
    await Notification.findByIdAndDelete(id);

    res.json({ 
      success: true,
      message: "Notification permanently deleted" 
    });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

// BULK DELETE - Admin can delete multiple notifications
router.post("/bulk-delete", adminAuth, async (req, res) => {
  try {
    const { ids = [] } = req.body;

    await Notification.deleteMany({ _id: { $in: ids } });

    res.json({ 
      success: true,
      message: `${ids.length} notifications permanently deleted` 
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({ message: "Failed to delete notifications" });
  }
});

export default router;
