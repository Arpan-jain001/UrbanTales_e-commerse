import mongoose from "mongoose";

const stockAlertSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    active: { type: Boolean, default: true },
    notifiedAt: { type: Date, default: null },
    variant: { type: String, default: "" },
  },
  { timestamps: true }
);

stockAlertSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.models.StockAlert || mongoose.model("StockAlert", stockAlertSchema);
