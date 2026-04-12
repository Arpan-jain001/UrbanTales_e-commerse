import Order from "../models/Order.js";

const STATUS_MAP = {
  PENDING: "Pending",
  PLACED: "Placed",
  SHIPPED: "Shipped",
  "OUT FOR DELIVERY": "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const listOrdersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || "";
    const query = {};

    if (status && status !== "ALL") {
      query.orderStatus = STATUS_MAP[String(status).trim().toUpperCase()] || status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate("userId", "fullName name email phone")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    const transformedOrders = orders.map((order) => {
      if (order.userId) {
        order.user = order.userId;
        delete order.userId;
      }
      return order;
    });

    return res.status(200).json({
      orders: transformedOrders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("listOrdersForAdmin error:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};
