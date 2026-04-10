import mongoose from "mongoose";

const colorOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    image: { type: String, default: "" },
  },
  { _id: false }
);

const mediaOrderSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], required: true },
    url: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subCategory: { type: String, default: "", trim: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: null },
    image: { type: String, default: "" },
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    mediaOrder: { type: [mediaOrderSchema], default: [] },
    stock: { type: Number, required: true },
    delivery: { type: String, default: "" },
    availableSizes: { type: [String], default: [] },
    availableColors: { type: [colorOptionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product || mongoose.model("Product", productSchema);
