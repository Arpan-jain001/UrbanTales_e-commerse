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

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], default: [] },
    orderStatus: {
      type: String,
      enum: ["Placed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned", "Pending"],
      default: "Pending",
    },
    paymentMethod: { type: String, default: "" },
    paymentStatus: { type: String, default: "" },
    totalAmount: { type: Number, default: 0 },
    deliveredAt: { type: Date, default: null },
    name: { type: String, default: "" },
    mobile: { type: String, default: "" },
    address: { type: String, default: "" },
    instructions: { type: String, default: "" },
    returnReason: { type: String, default: "" },
    returnStatus: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", orderSchema);
  
