// routes/notificationRoutes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// GET user notifications (exclude soft deleted)
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const notifications = await Notification.find({
      $or: [
        { userId },
        { 
          userId: null,
          $or: [
            { targetAudience: "USERS" },
            { targetAudience: "BOTH" },
          ]
        },
      ],
      deletedBy: { $ne: userId } // ← Hide if user deleted
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(notifications);
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

// POST mark as read
router.post("/mark-read", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { ids = [] } = req.body;

    await Notification.updateMany(
      { 
        _id: { $in: ids }, 
        $or: [
          { userId }, 
          { userId: null }
        ] 
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
router.get("/unread-count", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;

    const count = await Notification.countDocuments({
      $or: [
        { userId },
        { userId: null, targetAudience: "USERS" },
        { userId: null, targetAudience: "BOTH" },
      ],
      isRead: false,
      deletedBy: { $ne: userId }
    });

    res.json({ count });
  } catch (err) {
    console.error("Unread count error:", err);
    res.status(500).json({ message: "Failed to fetch count" });
  }
});

// DELETE (soft delete - only for this user)
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const notif = await Notification.findById(id);

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Soft delete - add user to deletedBy array
    await Notification.findByIdAndUpdate(
      id,
      { $addToSet: { deletedBy: userId } }
    );

    res.json({ message: "Notification hidden" });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

export default router;
