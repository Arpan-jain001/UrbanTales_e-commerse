import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
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
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
