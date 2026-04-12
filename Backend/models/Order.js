import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    sellerId: { type: String, default: "" },
    name: { type: String, default: "" },
    price: { type: Number, default: 0 },
    image: { type: String, default: "" },
    qty: { type: Number, default: 1 },
    selectedSize: { type: String, default: "" },
    selectedColor: { type: String, default: "" },
    selectedColorImage: { type: String, default: "" },
    status: { type: String, default: "Pending" },
  },
  { _id: false }
);

const timelineSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },
    orderStatus: {
      type: String,
      enum: [
        "Placed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
        "Pending",
      ],
      default: "Pending",
    },
    paymentMethod: { type: String, default: "" },
    paymentStatus: { type: String, default: "" },
    paymentGateway: { type: String, default: "" },
    gatewayOrderId: { type: String, default: "", index: true },
    gatewayPaymentId: { type: String, default: "", index: true },
    subtotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    giftCode: { type: String, default: "" },
    giftType: { type: String, default: "" },
    giftBalanceUsed: { type: Number, default: 0 },
    giftBalanceRefunded: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    deliveredAt: { type: Date, default: null },
    name: { type: String, default: "" },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },
    instructions: { type: String, default: "" },
    trackingInfo: { type: String, default: "" },
    cancelReason: { type: String, default: "" },
    returnReason: { type: String, default: "" },
    returnStatus: { type: String, default: "" },
    statusTimeline: { type: [timelineSchema], default: [] },
    returnTimeline: { type: [timelineSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
  
