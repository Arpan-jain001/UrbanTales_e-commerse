import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String },
    city: { type: String },
    pincode: { type: String },
    tag: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: {
      type: String,
      default: "",
      validate: {
        validator: (value) => !value || /^[6-9]\d{9}$/.test(value),
        message: "Phone number must be a valid Indian mobile number",
      },
    },
    role: { type: String, enum: ["user"], default: "user" },
    password: { type: String, required: true },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },

    bio: { type: String, default: "" },
    dob: { type: String, default: "" },
    gender: { type: String, default: "" },
    profileImage: { type: String, default: "" },
    address: { type: [addressSchema], default: [] },

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

    resetOTP: { type: String, default: null },
    resetOTPExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
