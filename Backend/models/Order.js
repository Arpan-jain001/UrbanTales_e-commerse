import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  price: Number,
  image: String,
  qty: Number,
  status: { type: String, default: "Pending" }
});
const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [orderItemSchema],
  orderStatus: {
    type: String,
    enum: ["Placed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned", "Pending"],
    default: "Pending",
  },
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  deliveredAt: Date,
  name: String,
  mobile: String,
  address: String,
  instructions: String,
  returnReason: String,
  returnStatus: String,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
  