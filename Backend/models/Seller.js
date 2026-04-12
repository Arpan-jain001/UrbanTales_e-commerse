import mongoose from "mongoose";

const sellerSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, immutable: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    shopName: { type: String, default: "" },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    avatar: { type: String, default: "" },
    password: { type: String, required: true, default: "google-oauth" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    verificationSource: { type: String, default: "" },
    verificationOtp: { type: String, default: null },
    verificationOtpExpires: { type: Date, default: null },
    verificationToken: { type: String, default: null },
    verificationTokenExpires: { type: Date, default: null },
    verificationDeadline: { type: Date, default: null },
    lastVerificationEmailSentAt: { type: Date, default: null },
    verificationReminderCount: { type: Number, default: 0 },
    welcomeEmailSentAt: { type: Date, default: null },
    adminUnverifyReason: { type: String, default: "" },

    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
