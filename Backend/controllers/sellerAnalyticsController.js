import Product from "../models/product.js";
import Order from "../models/Order.js";

export const stats = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const products = await Product.countDocuments({ sellerId });
    const sellerProducts = await Product.find({ sellerId }, { _id: 1 });
    const sellerProductIds = sellerProducts.map(p => String(p._id));
    const orders = await Order.find({ 'items.id': { $in: sellerProductIds } });

    const sold = orders.reduce((acc, order) =>
      acc +
      order.items
        .filter(i => sellerProductIds.includes(i.id) && i.status === "Delivered")
        .reduce((sum, i) => sum + i.qty, 0),
      0
    );
    const earnings = orders.reduce((acc, order) =>
      acc +
      order.items
        .filter(i => sellerProductIds.includes(i.id) && i.status === "Delivered")
        .reduce((sum, i) => sum + i.qty * i.price, 0),
      0
    );
    res.json({ products, sold, earnings });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch seller stats." });
  }
};
