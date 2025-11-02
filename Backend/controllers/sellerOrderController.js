import Order from "../models/Order.js";
import Product from "../models/product.js";

// Seller's orders (filtered by their products)
export const listSellerOrders = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const sellerProducts = await Product.find({ sellerId }, { _id: 1 });
    const sellerProductIds = sellerProducts.map(p => String(p._id));
    const orders = await Order.find({ "items.id": { $in: sellerProductIds } }).sort({ createdAt: -1 });
    const sellerOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => sellerProductIds.includes(item.id))
    }));
    res.json({ orders: sellerOrders });
  } catch {
    res.status(500).json({ message: "Failed to fetch seller orders" });
  }
};

// Update status for specific order item (owned by seller only)
export const updateOrderItemStatus = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const { orderId, itemId } = req.params;
    const product = await Product.findOne({ _id: itemId, sellerId });
    if (!product) return res.status(403).json({ message: "Forbidden: This is not your product." });
    const order = await Order.findOne({ _id: orderId, "items.id": itemId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // --- The actual change: update nested item status ---
    let found = false;
    order.items.forEach(item => {
      if (item.id === itemId) {
        item.status = req.body.status;
        found = true;
      }
    });
    if (!found) return res.status(404).json({ message: "Item not found in order" });

    await order.save();
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update item status" });
  }
};

