import Product from "../models/product.js";
import Order from "../models/Order.js";
import StockAlert from "../models/StockAlert.js";

export const stats = async (req, res) => {
  try {
    const sellerId = String(req.seller._id);
    const sellerProducts = await Product.find({ sellerId: req.seller._id }).select(
      "_id stock"
    );
    const sellerProductIds = sellerProducts.map((product) => String(product._id));
    const orders = await Order.find({ "items.sellerId": sellerId }).lean();

    let soldUnits = 0;
    let grossEarnings = 0;
    let pendingOrders = 0;
    let activeReturnRequests = 0;

    for (const order of orders) {
      const sellerItems = (order.items || []).filter(
        (item) => String(item.sellerId || "") === sellerId
      );

      if (!sellerItems.length) {
        continue;
      }

      let hasPendingItem = false;
      for (const item of sellerItems) {
        if (item.status === "Delivered") {
          soldUnits += Number(item.qty || 0);
          grossEarnings += Number(item.qty || 0) * Number(item.price || 0);
        }

        if (
          ["Pending", "Placed", "Picked Up", "Out for Delivery", "Shipped"].includes(
            item.status
          )
        ) {
          hasPendingItem = true;
        }
      }

      if (hasPendingItem) {
        pendingOrders += 1;
      }

      if (
        ["Requested", "Pickup Scheduled", "Picked Up", "Refund Initiated"].includes(
          order.returnStatus
        )
      ) {
        activeReturnRequests += 1;
      }
    }

    const lowStockProducts = sellerProducts.filter(
      (product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5
    ).length;
    const outOfStockProducts = sellerProducts.filter(
      (product) => Number(product.stock || 0) <= 0
    ).length;
    const stockRequestCount = sellerProductIds.length
      ? await StockAlert.countDocuments({
          productId: { $in: sellerProductIds },
          active: true,
        })
      : 0;

    return res.json({
      products: sellerProducts.length,
      lowStockProducts,
      outOfStockProducts,
      soldUnits,
      grossEarnings,
      pendingOrders,
      activeReturnRequests,
      stockRequestCount,
    });
  } catch (err) {
    console.error("Seller analytics stats error:", err);
    return res.status(500).json({ error: "Failed to fetch seller stats." });
  }
};
