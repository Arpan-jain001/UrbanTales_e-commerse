import Order from "../models/Order.js";
import Product from "../models/Product.js";

// GET /api/sellers/orders
export const listSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    // Find products for this seller
    const sellerProducts = await Product.find({ sellerId }, { _id: 1 });
    const sellerProductIds = sellerProducts.map(p => String(p._id));

    // Find orders containing seller's products
    const orders = await Order.find({ "items.id": { $in: sellerProductIds } }).sort({ createdAt: -1 });

    // In each order, show only items from this seller
    const sellerOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => sellerProductIds.includes(item.id))
    }));

    res.json({ orders: sellerOrders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

// PUT /api/sellers/orders/:orderId/item/:itemId/status
export const updateOrderItemStatus = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { orderId, itemId } = req.params;

    // Ensure this is seller's product
    const product = await Product.findOne({ _id: itemId, sellerId });
    if (!product) return res.status(403).json({ message: "Forbidden: Not your product." });

    // Find the order and make sure it contains the item
    const order = await Order.findOne({ _id: orderId, "items.id": itemId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update only the item's status belonging to seller
    const item = order.items.find(i => i.id === itemId);
    if (!item) return res.status(404).json({ message: "Item not found in order" });
    item.status = req.body.status;

    await order.save();
    res.json({ message: "Order item status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update item status" });
  }
};

// GET /api/sellers/orders/analytics/salesChart
export const salesChart = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const sellerProducts = await Product.find({ sellerId }, { _id: 1 });
    const sellerProductIds = sellerProducts.map(p => String(p._id));
    // Aggregate sales by month only for seller's products and delivered items
    const monthly = await Order.aggregate([
      { $unwind: "$items" },
      { $match: { "items.id": { $in: sellerProductIds }, "items.status": "Delivered" }},
      { $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        earnings: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json(monthly.map(m => ({
      month: `${m._id.month}-${m._id.year}`,
      earnings: m.earnings
    })));
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sales chart data" });
  }
};
