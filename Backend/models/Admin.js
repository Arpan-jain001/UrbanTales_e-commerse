import mongoose from "mongoose";
import bcrypt from "bcrypt";

const adminSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["SUPER_ADMIN", "ADMIN"], default: "ADMIN" },

    // Profile completion fields
    phone: String,
    avatar: String,
    designation: String,
    bio: String,

    // OTP for forgot password
    resetOTP: String,
    resetOTPExpires: Date,
  },
  { timestamps: true }
);

// Hash password before save
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

adminSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("Admin", adminSchema);
