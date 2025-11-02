import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: String,
  price: Number,
  image: String,
  qty: Number,
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Cart", cartSchema);
