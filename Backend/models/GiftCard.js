import mongoose from "mongoose";

const walletEntrySchema = new mongoose.Schema(
  {
    source: {
      type: String,
      enum: ["RETURN_REFUND", "ADMIN_CREDIT", "CHECKOUT_DEBIT", "EXPIRED"],
      default: "RETURN_REFUND",
    },
    amount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    expiredAmount: { type: Number, default: 0 },
    orderId: { type: String, default: "" },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
    status: { type: String, enum: ["ACTIVE", "USED", "EXPIRED"], default: "ACTIVE" },
    note: { type: String, default: "" },
  },
  { _id: true }
);

const giftCardSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    kind: { type: String, enum: ["PROMO", "WALLET"], default: "PROMO", index: true },
    type: { type: String, enum: ["flat", "percent"], required: true, default: "percent" },
    value: { type: Number, required: true, default: 0 },
    active: { type: Boolean, default: true },
    minPurchase: { type: Number, default: 0 },
    expiresAt: { type: Date, default: null },
    ownerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    balance: { type: Number, default: 0 },
    walletEntries: { type: [walletEntrySchema], default: [] },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// giftCardSchema.index({ code: 1 });
giftCardSchema.index({ ownerUserId: 1, kind: 1 });

export default mongoose.models.GiftCard || mongoose.model("GiftCard", giftCardSchema);
