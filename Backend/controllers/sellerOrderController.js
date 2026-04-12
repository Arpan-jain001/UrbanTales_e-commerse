import Order from "../models/Order.js";
import Product from "../models/product.js";
import User from "../models/user.js";
import { sendUserOrderStatusMail } from "../utils/userOrderMail.js";
import { creditGiftCardWallet } from "./giftCardController.js";

const RETURN_STATUSES = [
  "Requested",
  "Pickup Scheduled",
  "Picked Up",
  "Refund Initiated",
  "Refunded",
];

export const listSellerOrders = async (req, res) => {
  try {
    const sellerId = String(req.seller._id);
    const sellerProducts = await Product.find({ sellerId }, { _id: 1 });
    const sellerProductIds = sellerProducts.map((product) => String(product._id));

    const orders = await Order.find({ "items.id": { $in: sellerProductIds } }).sort({ createdAt: -1 });

    const sellerOrders = orders.map((order) => ({
      ...order.toObject(),
      items: order.items.filter((item) => sellerProductIds.includes(String(item.id))),
    }));

    res.json({ orders: sellerOrders });
  } catch (err) {
    console.error("Seller orders fetch failed:", err);
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

export const updateOrderItemStatus = async (req, res) => {
  try {
    const sellerId = String(req.seller._id);
    const { orderId, itemId } = req.params;

    const product = await Product.findOne({ _id: itemId, sellerId });
    if (!product) return res.status(403).json({ message: "Forbidden: Not your product." });

    const order = await Order.findOne({ _id: orderId, "items.id": itemId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.items.find((orderItem) => String(orderItem.id) === String(itemId));
    if (!item) return res.status(404).json({ message: "Item not found in order" });
    item.status = req.body.status;

    const allStatuses = order.items.map((orderItem) => orderItem.status || order.orderStatus);
    if (allStatuses.every((status) => status === "Delivered")) {
      order.orderStatus = "Delivered";
      order.deliveredAt = order.deliveredAt || new Date();
    } else if (allStatuses.some((status) => status === "Out for Delivery")) {
      order.orderStatus = "Out for Delivery";
    } else if (allStatuses.some((status) => status === "Shipped")) {
      order.orderStatus = "Shipped";
    } else if (allStatuses.some((status) => status === "Placed")) {
      order.orderStatus = "Placed";
    }

    order.statusTimeline = [
      ...(order.statusTimeline || []),
      { status: item.status, note: `${item.name} updated by seller`, createdAt: new Date() },
    ];

    await order.save();

    const user = await User.findById(order.userId).select("fullName email");
    if (user) {
      try {
        await sendUserOrderStatusMail({ user, order, item });
      } catch (emailError) {
        console.error("Failed to send order status update email:", emailError.message);
      }
    }

    res.json({ message: "Order item status updated", order });
  } catch (err) {
    console.error("Seller order status update failed:", err);
    res.status(500).json({ message: "Failed to update item status" });
  }
};

export const updateOrderReturnStatus = async (req, res) => {
  try {
    const sellerId = String(req.seller._id);
    const { orderId } = req.params;
    const { returnStatus, note = "" } = req.body;

    if (!RETURN_STATUSES.includes(returnStatus)) {
      return res.status(400).json({ message: "Invalid return status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const sellerItems = order.items.filter((item) => String(item.sellerId || "") === sellerId);
    if (!sellerItems.length) {
      return res.status(403).json({ message: "Forbidden: Order does not belong to seller." });
    }

    if (!order.returnStatus) {
      return res.status(400).json({ message: "No active return request found for this order." });
    }

    order.returnStatus = returnStatus;
    order.returnTimeline = [
      ...(order.returnTimeline || []),
      { status: returnStatus, note, createdAt: new Date() },
    ];

    if (returnStatus === "Refunded") {
      const refundAmount = sellerItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
        0
      );

      await creditGiftCardWallet({
        userId: order.userId,
        amount: refundAmount,
        orderId: order.orderId || String(order._id),
        sellerId,
        note: note || `Refund for returned order ${order.orderId || order._id}`,
      });

      order.giftBalanceRefunded = Number(order.giftBalanceRefunded || 0) + refundAmount;
      order.orderStatus = "Returned";
      order.items = order.items.map((item) =>
        String(item.sellerId || "") === sellerId ? { ...item, status: "Returned" } : item
      );
    }

    await order.save();

    const user = await User.findById(order.userId).select("fullName email");
    if (user && sellerItems[0]) {
      try {
        await sendUserOrderStatusMail({
          user,
          order,
          item: {
            ...sellerItems[0].toObject?.(),
            ...sellerItems[0],
            name: sellerItems[0].name,
            qty: sellerItems[0].qty,
            status: returnStatus === "Refunded" ? "Returned" : `Return ${returnStatus}`,
          },
        });
      } catch (emailError) {
        console.error("Failed to send return status email:", emailError.message);
      }
    }

    return res.json({ message: "Return status updated successfully", order });
  } catch (err) {
    console.error("Seller return status update failed:", err);
    return res.status(500).json({ message: "Failed to update return status" });
  }
};

export const salesChart = async (req, res) => {
  try {
    const sellerId = String(req.seller._id);
    const sellerProducts = await Product.find({ sellerId }, { _id: 1 });
    const sellerProductIds = sellerProducts.map((product) => String(product._id));

    const monthly = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.id": { $in: sellerProductIds }, "items.status": "Delivered" } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          earnings: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json(
      monthly.map((item) => ({
        month: `${item._id.month}-${item._id.year}`,
        earnings: item.earnings,
      }))
    );
  } catch (err) {
    console.error("Seller sales chart failed:", err);
    res.status(500).json({ message: "Failed to fetch sales chart data" });
  }
};
