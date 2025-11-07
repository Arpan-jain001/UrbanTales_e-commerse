import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { sendSellerOtpMail } from "../utils/SellersendOtpMail.js";


function generateUsername(fullName) {
  const base = fullName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${rand}`;
}

export async function signup(req, res) {
  try {
    const { fullName, username, email, phone, shopName, address, bio, password } = req.body;
    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ error: "Seller with this email already exists!" });

    let autoUsername = username || generateUsername(fullName);
    let _username = autoUsername;
    let taken = await Seller.findOne({ username: _username });
    while (taken) {
      _username = autoUsername.replace(/-\d+$/, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      taken = await Seller.findOne({ username: _username });
    }
    const hash = await bcrypt.hash(password, 10);
    const seller = await Seller.create({
      fullName, username: _username, email, phone, shopName, address, bio, password: hash
    });

    const token = jwt.sign({ id: seller._id }, process.env.SELLER_JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      seller: { _id: seller._id, fullName, username: _username, email, phone, shopName, address, bio }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(400).json({ error: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: seller._id }, process.env.SELLER_JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    seller: { _id: seller._id, fullName: seller.fullName, username: seller.username, email: seller.email, phone: seller.phone, shopName: seller.shopName, address: seller.address, bio: seller.bio }
  });
}

// Request OTP
export async function requestPasswordReset(req, res) {
  const { email } = req.body;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(404).json({ error: "Seller not found" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  seller.otp = otp;
  seller.otpExpiry = otpExpiry;
  await seller.save();

  try {
    await sendSellerOtpMail({ to: email, otp });
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP email" });
  }
}

// Reset password with OTP
export async function resetPasswordWithOtp(req, res) {
  const { email, otp, newPassword } = req.body;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(404).json({ error: "Seller not found" });
  if (!seller.otp || seller.otp !== otp)
    return res.status(400).json({ error: "Invalid OTP" });
  if (seller.otpExpiry < Date.now())
    return res.status(400).json({ error: "OTP expired" });

  seller.password = await bcrypt.hash(newPassword, 10);
  seller.otp = null;
  seller.otpExpiry = null;
  await seller.save();
  res.json({ message: "Password reset successful" });
}
// Verify OTP only (for pre-password step)
export async function verifyOtp(req, res) {
  const { email, otp } = req.body;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(404).json({ error: "Seller not found" });
  if (!seller.otp || seller.otp !== otp)
    return res.status(400).json({ error: "Invalid OTP" });
  if (seller.otpExpiry < Date.now())
    return res.status(400).json({ error: "OTP expired" });
  res.json({ message: "OTP verified" });
}
