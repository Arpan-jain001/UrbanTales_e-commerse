import Order from "../models/Order.js";

export const listOrdersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status || "";

    // Build query
    const query = {};
    
    // Status filter
    if (status && status !== "ALL") {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'fullName name email phone') // ← USER POPULATE
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ]);

    // Transform userId to user for frontend compatibility
    const transformedOrders = orders.map(order => {
      if (order.userId) {
        order.user = order.userId;
        delete order.userId;
      }
      return order;
    });

    console.log('Orders fetched:', transformedOrders.length);
    if (transformedOrders.length > 0) {
      console.log('Sample order user:', transformedOrders[0].user);
    }

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
