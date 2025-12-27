import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["VIDEO", "BANNER", "ANIMATION", "3D"],
      required: true,
    },
    mediaUrl: {
      type: String,
    },
    duration: {
      type: Number,
      default: 8,
    },
    placement: {
      type: String,
      enum: ["HOMEPAGE_FULLSCREEN", "NAVBAR", "SIDEBAR", "MODAL"],
      default: "HOMEPAGE_FULLSCREEN",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    priority: {
      type: Number,
      default: 0,
    },
    clickAction: {
      type: String,
    },
    targetAudience: {
      type: String,
      enum: ["ALL", "NEW_USERS", "RETURNING_USERS"],
      default: "ALL",
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    theme: {
      type: String,
      enum: ["NEWYEAR", "DIWALI", "CHRISTMAS", "SALE", "GENERIC"],
      default: "GENERIC",
    },
  },
  { timestamps: true }
);

promotionSchema.index({ isActive: 1, priority: -1 });
promotionSchema.index({ startDate: 1, endDate: 1 });

export default mongoose.model("Promotion", promotionSchema);
