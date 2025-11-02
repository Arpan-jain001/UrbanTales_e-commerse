import SellerNotification from "../models/SellerNotification.js";

// Get all notifications for signed-in seller
export const list = async (req, res) => {
  const notifs = await SellerNotification.find({ sellerId: req.seller._id })
    .sort({ time: -1 })
    .limit(50);
  res.json(notifs);
};

// Mark all as read
export const readAll = async (req, res) => {
  await SellerNotification.updateMany(
    { sellerId: req.seller._id, isRead: false },
    { $set: { isRead: true } }
  );
  res.json({ message: "All notifications marked read" });
};
