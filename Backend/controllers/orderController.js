import { v4 as uuidv4 } from "uuid";
import Order from "../models/Order.js";
import Product from "../models/product.js";
import Seller from "../models/Seller.js";
import User from "../models/user.js";
import { sendSellerOrderMail } from "../utils/sellerOrderMail.js";
import { sendUserOrderConfirmationMail } from "../utils/userOrderMail.js";
import { calculateCheckoutPricing } from "../utils/checkoutPricing.js";
import {
  getRazorpayClient,
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from "../utils/razorpayClient.js";

const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const appendStatusTimeline = (order, status, note = "") => {
  order.statusTimeline = [
    ...(order.statusTimeline || []),
    { status, note, createdAt: new Date() },
  ];
};

const appendReturnTimeline = (order, status, note = "") => {
  order.returnTimeline = [
    ...(order.returnTimeline || []),
    { status, note, createdAt: new Date() },
  ];
};

const restoreOrderStock = async (order) => {
  for (const item of order.items || []) {
    if (!item?.id || !item?.qty) continue;
    await Product.findByIdAndUpdate(item.id, { $inc: { stock: Number(item.qty || 0) } });
  }
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
    const {
      name,
      mobile,
      address,
      instructions,
      paymentMethod,
      deliveryCharge = 0,
      giftCode = "",
      useGiftBalance = false,
      paymentDetails = {},
    } = req.body;

    if (!name || !mobile || !address || !paymentMethod) {
      return res.status(400).json({ message: "Missing order details" });
    }

    const orderId = uuidv4();
    const previewPricing = await calculateCheckoutPricing({
      userId,
      giftCode,
      useGiftBalance: Boolean(useGiftBalance),
      deliveryCharge,
      consumeGiftCode: false,
      consumeWallet: false,
    });

    const normalizedPaymentMethod = String(paymentMethod || "").toLowerCase();
    const requiresOnlinePayment =
      previewPricing.totalAmount > 0 && !["cod", "gift-card"].includes(normalizedPaymentMethod);

    let resolvedPaymentStatus = "Pending";
    let paymentGateway = "";
    let gatewayOrderId = "";
    let gatewayPaymentId = "";

    if (previewPricing.totalAmount <= 0) {
      resolvedPaymentStatus = "Successful";
    } else if (normalizedPaymentMethod === "cod") {
      resolvedPaymentStatus = "Pending";
    } else {
      const razorpayOrderId = paymentDetails?.razorpay_order_id;
      const razorpayPaymentId = paymentDetails?.razorpay_payment_id;
      const razorpaySignature = paymentDetails?.razorpay_signature;

      if (!requiresOnlinePayment || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
        return res.status(400).json({ message: "Verified payment details are required." });
      }

      if (!isRazorpayConfigured()) {
        return res.status(500).json({ message: "Payment gateway is not configured." });
      }

      const existingOrder = await Order.findOne({ gatewayPaymentId: razorpayPaymentId });
      if (existingOrder) {
        return res.status(409).json({
          message: "This payment has already been processed.",
          order: existingOrder,
        });
      }

      const signatureValid = verifyRazorpaySignature({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!signatureValid) {
        return res.status(400).json({ message: "Payment signature verification failed." });
      }

      const razorpay = getRazorpayClient();
      const [gatewayOrder, gatewayPayment] = await Promise.all([
        razorpay.orders.fetch(razorpayOrderId),
        razorpay.payments.fetch(razorpayPaymentId),
      ]);

      const expectedAmountInPaise = Math.round(previewPricing.totalAmount * 100);
      if (
        !gatewayOrder ||
        !gatewayPayment ||
        gatewayPayment.order_id !== razorpayOrderId ||
        Number(gatewayOrder.amount || 0) !== expectedAmountInPaise ||
        Number(gatewayPayment.amount || 0) !== expectedAmountInPaise
      ) {
        return res.status(400).json({ message: "Payment amount verification failed." });
      }

      if (!["authorized", "captured"].includes(String(gatewayPayment.status || "").toLowerCase())) {
        return res.status(400).json({
          message: `Payment is not completed. Current status: ${gatewayPayment.status || "unknown"}.`,
        });
      }

      resolvedPaymentStatus = "Successful";
      paymentGateway = "razorpay";
      gatewayOrderId = gatewayOrder.id;
      gatewayPaymentId = gatewayPayment.id;
    }

    const finalizedPricing = await calculateCheckoutPricing({
      userId,
      giftCode,
      useGiftBalance: Boolean(useGiftBalance),
      deliveryCharge,
      consumeGiftCode: Boolean(String(giftCode || "").trim()),
      consumeWallet: Boolean(useGiftBalance),
      walletOrderId: orderId,
      walletNote: `Applied on order ${orderId}`,
    });

    if (finalizedPricing.totalAmount !== previewPricing.totalAmount) {
      return res.status(409).json({
        message: "Checkout totals changed. Please review your cart and try again.",
      });
    }

    const orderItems = finalizedPricing.orderItems.map((item) => ({
      ...item,
      status: resolvedPaymentStatus === "Successful" ? "Placed" : "Pending",
    }));

    const newOrder = new Order({
      orderId,
      userId,
      items: orderItems,
      orderStatus: resolvedPaymentStatus === "Successful" ? "Placed" : "Pending",
      paymentMethod: previewPricing.totalAmount <= 0 ? "gift-card" : paymentMethod,
      paymentStatus: resolvedPaymentStatus,
      paymentGateway,
      gatewayOrderId,
      gatewayPaymentId,
      subtotal: finalizedPricing.subtotal,
      deliveryCharge: finalizedPricing.deliveryCharge,
      discountAmount: finalizedPricing.discountAmount,
      giftCode: finalizedPricing.giftCode,
      giftType: finalizedPricing.giftType,
      giftBalanceUsed: finalizedPricing.giftBalanceUsed,
      totalAmount: Number(finalizedPricing.totalAmount),
      name,
      mobile,
      address,
      instructions,
      trackingInfo: `${getFrontendBaseUrl()}/trackorder?orderId=${encodeURIComponent(orderId)}`,
    });

    appendStatusTimeline(
      newOrder,
      resolvedPaymentStatus === "Successful" ? "Placed" : "Pending",
      paymentGateway
        ? "Order created after successful Razorpay verification."
        : "Order created successfully."
    );

    await newOrder.save();

    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.id, { $inc: { stock: -Number(item.qty || 0) } });
    }

    finalizedPricing.cart.items = [];
    await finalizedPricing.cart.save();
    await notifySellersForOrder(newOrder);

    const user = await User.findById(userId).select("fullName email");
    if (user) {
      try {
        await sendUserOrderConfirmationMail({ user, order: newOrder });
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError.message);
      }
    }

    return res.status(201).json({ message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("ORDER CREATE ERROR:", error);
    return res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Server error creating order" });
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

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      userId: req.userId,
      $or: [{ _id: id }, { orderId: id }],
    });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching order by id:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
};

export const getPublicOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id }, { orderId: id }],
    }).select(
      "orderId items orderStatus paymentStatus paymentMethod totalAmount name mobile address instructions deliveredAt trackingInfo returnReason returnStatus cancelReason createdAt statusTimeline returnTimeline giftBalanceUsed giftBalanceRefunded"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("Error fetching public order by id:", error);
    return res.status(500).json({ message: "Error fetching order" });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body?.reason || "").trim();
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!["Placed", "Shipped", "Out for Delivery", "Pending"].includes(order.orderStatus)) {
      return res.status(400).json({ message: "Order cannot be cancelled" });
    }
    if (!reason) {
      return res.status(400).json({ message: "Cancellation reason is required" });
    }
    order.orderStatus = "Cancelled";
    order.cancelReason = reason;
    order.items = order.items.map((item) => ({ ...item, status: "Cancelled" }));
    appendStatusTimeline(order, "Cancelled", reason);
    await order.save();
    await restoreOrderStock(order);
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling order" });
  }
};

export const returnOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = String(req.body.reason || "").trim();
    const order = await Order.findOne({ _id: id, userId: req.userId });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!reason) {
      return res.status(400).json({ message: "Return reason is required" });
    }
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
    order.returnStatus = "Requested";
    order.returnReason = reason;
    appendReturnTimeline(order, "Requested", reason);
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
    if (!order || order.returnStatus !== "Requested") {
      return res.status(400).json({ message: "Cannot cancel return" });
    }
    order.returnStatus = "";
    order.returnReason = "";
    order.returnTimeline = [];
    await order.save();
    res.status(200).json({ message: "Return cancelled" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling return" });
  }
};
