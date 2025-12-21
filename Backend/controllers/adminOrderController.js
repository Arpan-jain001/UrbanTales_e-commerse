import Order from "../models/Order.js";

export const listOrdersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [orders, total] = await Promise.all([
      Order.find({})
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments({}),
    ]);

    return res.status(200).json({
      orders,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("listOrdersForAdmin error:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};
