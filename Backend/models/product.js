import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,             // Keep for backward compatibility
  images: [String],          // New: Multiple image URLs
  videos: [String],          // New: Multiple video URLs
  stock: { type: Number, required: true },
  delivery: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Product", productSchema);
