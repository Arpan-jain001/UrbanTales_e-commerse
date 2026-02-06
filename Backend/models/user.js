import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    street: { type: String }, // ✅ special chars allowed by default
    city: { type: String },
    pincode: { type: String },
    tag: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true },

    phone: { type: String, required: true, match: /^[6-9]\d{9}$/ },

    role: { type: String, enum: ["user"], default: "user" },

    password: { type: String, required: true },

    // ✅ PROFILE FIELDS (root level)
    bio: { type: String, default: "" },
    dob: { type: String, default: "" }, // keep string (simple)
    gender: { type: String, default: "" },
    profileImage: { type: String, default: "" },

    // ✅ ADDRESS ARRAY (old + new compatible)
    address: { type: [addressSchema], default: [] },

    resetOTP: String,
    resetOTPExpires: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
