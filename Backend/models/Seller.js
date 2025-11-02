import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true, immutable: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: String,
  shopName: String,
  address: String,
  bio: String,
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
export default mongoose.model("Seller", sellerSchema);
