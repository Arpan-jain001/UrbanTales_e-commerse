import { v4 as uuidv4 } from "uuid";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/product.js";
import Seller from "../models/Seller.js";
import { sendSellerOrderMail } from "../utils/sellerOrderMail.js";

const hydrateCartItems = async (items = []) => {
  const productIds = items.map((item) => item.id).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).select("sellerId name image images");
  const byId = new Map(products.map((product) => [String(product._id), product]));

  return items.map((item) => {
    const product = byId.get(String(item.id));
    const fallbackImage = product?.images?.[0] || product?.image || item.image || item.selectedColorImage || "";
    return {
      id: item.id,
      sellerId: item.sellerId || (product?.sellerId ? String(product.sellerId) : ""),
      name: item.name || product?.name || "",
      price: Number(item.price || 0),
      image: fallbackImage,
      qty: Number(item.qty || 1),
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
      selectedColorImage: item.selectedColorImage || "",
      status: item.status || "Pending",
    };
  });
};

const notifySellersForOrder = async (order) => {
  const grouped = order.items.reduce((acc, item) => {
    if (!item.sellerId) return acc;
    if (!acc[item.sellerId]) acc[item.sellerId] = [];
    acc[item.sellerId].push(item);
    return acc;
  }, {});

  for (const [sellerId, items] of Object.entries(grouped)) {
    try {
      const seller = await Seller.findById(sellerId);
      if (!seller) continue;
      await sendSellerOrderMail({ seller, order, items });
    } catch (error) {
      console.error(`Failed to send seller order email for seller ${sellerId}:`, error.message);
    }
  }
};

export const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId });
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty, cannot create order" });
    }

    const { name, mobile, address, instructions, paymentMethod, paymentStatus, totalAmount } = req.body;
    if (!name || !mobile || !address || !paymentMethod || !paymentStatus || !totalAmount) {
      return res.status(400).json({ message: "Missing order details" });
    }

    const orderItems = await hydrateCartItems(cart.items);
    const orderId = uuidv4();
    const newOrder = new Order({
      orderId,
      userId,
      items: orderItems,
      orderStatus: paymentStatus === "Successful" ? "Placed" : "Pending",
      paymentMethod,
      paymentStatus,
      totalAmount: Number(totalAmount),
      name,
      mobile,
      address,
      instructions,
    });

    await newOrder.save();
    cart.items = [];
    await cart.save();
    await notifySellersForOrder(newOrder);

    res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("ORDER CREATE ERROR:", error);
    res.status(500).json({ message: "Server error creating order", errorMessage: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["Placed", "Shipped", "Out for Delivery", "Pending"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }
    order.orderStatus = "Cancelled";
    await order.save();
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order" });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = req.body.reason || "";
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.orderStatus !== "Delivered") {
      return res.status(400).json({ message: "Order not eligible for return" });
    }
    if (!order.deliveredAt) {
      return res.status(400).json({ message: "Delivery date missing" });
    }
    const daysSinceDelivery = (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceDelivery > 4) {
      return res.status(400).json({ message: "Return period expired" });
    }
    order.orderStatus = "Returned";
    order.returnStatus = "Requested";
    order.returnReason = reason;
    await order.save();
    res.status(200).json({ message: "Return processed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error processing return" });
  }
};

export const cancelReturn = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order || order.orderStatus !== "Returned" || order.returnStatus !== "Requested") {
      return res.status(400).json({ message: "Cannot cancel return" });
    }
    order.orderStatus = "Delivered";
    order.returnStatus = "";
    order.returnReason = "";
    await order.save();
    res.status(200).json({ message: "Return cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling return" });
  }
};
