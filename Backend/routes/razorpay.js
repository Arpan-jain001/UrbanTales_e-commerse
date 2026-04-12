import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { calculateCheckoutPricing } from "../utils/checkoutPricing.js";
import {
  getRazorpayClient,
  isRazorpayConfigured,
  verifyRazorpaySignature,
} from "../utils/razorpayClient.js";

const router = express.Router();

router.post("/order", verifyToken, async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(500).json({
        message: "Payment gateway is not configured.",
      });
    }

    const { giftCode = "", useGiftBalance = false, deliveryCharge = 50 } = req.body || {};
    const pricing = await calculateCheckoutPricing({
      userId: req.userId,
      giftCode,
      useGiftBalance: Boolean(useGiftBalance),
      deliveryCharge,
      consumeGiftCode: false,
      consumeWallet: false,
    });

    if (pricing.totalAmount <= 0) {
      return res.status(400).json({
        message: "This order is fully covered and does not require online payment.",
        pricing,
      });
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.create({
      amount: Math.round(pricing.totalAmount * 100),
      currency: "INR",
      receipt: `ut_${String(req.userId).slice(-6)}_${Date.now()}`,
      notes: {
        userId: String(req.userId),
        giftCode: pricing.giftCode || "",
        giftBalanceUsed: String(pricing.giftBalanceUsed || 0),
      },
    });

    return res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      pricing: {
        subtotal: pricing.subtotal,
        deliveryCharge: pricing.deliveryCharge,
        discountAmount: pricing.discountAmount,
        giftBalanceUsed: pricing.giftBalanceUsed,
        totalAmount: pricing.totalAmount,
      },
    });
  } catch (error) {
    console.error("Razorpay create order error:", error);
    return res.status(error.statusCode || 500).json({
      message: error.message || "Server error during order creation.",
    });
  }
});

router.post("/verify", verifyToken, async (req, res) => {
  try {
    if (!isRazorpayConfigured()) {
      return res.status(500).json({ message: "Payment gateway is not configured." });
    }

    const {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    } = req.body || {};

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Incomplete payment verification payload." });
    }

    const signatureValid = verifyRazorpaySignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!signatureValid) {
      return res.status(400).json({ message: "Invalid payment signature." });
    }

    const razorpay = getRazorpayClient();
    const [gatewayOrder, gatewayPayment] = await Promise.all([
      razorpay.orders.fetch(razorpayOrderId),
      razorpay.payments.fetch(razorpayPaymentId),
    ]);

    if (!gatewayOrder || !gatewayPayment) {
      return res.status(404).json({ message: "Unable to verify payment details." });
    }

    if (gatewayPayment.order_id !== razorpayOrderId) {
      return res.status(400).json({ message: "Payment does not belong to this order." });
    }

    if (!["authorized", "captured"].includes(String(gatewayPayment.status || "").toLowerCase())) {
      return res.status(400).json({
        message: `Payment is not completed. Current status: ${gatewayPayment.status || "unknown"}.`,
      });
    }

    return res.status(200).json({
      verified: true,
      payment: {
        orderId: gatewayOrder.id,
        paymentId: gatewayPayment.id,
        amount: Number(gatewayPayment.amount || 0) / 100,
        method: gatewayPayment.method || "",
        status: gatewayPayment.status || "",
      },
    });
  } catch (error) {
    console.error("Razorpay verification error:", error);
    return res.status(500).json({
      message: error.message || "Unable to verify payment.",
    });
  }
});

export default router;
