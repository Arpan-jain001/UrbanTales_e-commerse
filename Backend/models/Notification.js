import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: false,
      index: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
      index: true,
    },
    targetAudience: {
      type: String,
      enum: ["USERS", "SELLERS", "ADMINS", "BOTH", "ALL"],
      default: "USERS",
    },
    senderType: {
      type: String,
      enum: ["SELLER", "ADMIN", "SYSTEM"],
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel",
      required: false,
    },
    senderModel: {
      type: String,
      enum: ["Seller", "Admin"],
    },
    senderName: { type: String },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["ORDER", "OFFER", "SYSTEM", "GENERAL"],
      default: "GENERAL",
    },
    objective: {
      type: String,
      enum: ["order", "product", "account", "promotion", "announcement", "alert", "general"],
      default: "general",
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: false },
    image: { type: String, default: "" },
    link: { type: String },
    isRead: { type: Boolean, default: false },
    
    // Soft delete - users/sellers can hide for themselves
    deletedBy: [{
      type: mongoose.Schema.Types.ObjectId,
    }],
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ sellerId: 1, createdAt: -1 });
notificationSchema.index({ adminId: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
