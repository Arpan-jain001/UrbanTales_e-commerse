import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Helper: Generate username from full name
function generateUsername(fullName) {
  const base = fullName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${rand}`;
}

// SIGNUP
export async function signup(req, res) {
  try {
    const { fullName, username, email, phone, shopName, address, bio, password } = req.body;
    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ error: "Seller with this email already exists!" });

    // Username auto-generate (if not from frontend)
    let autoUsername = username || generateUsername(fullName);
    let _username = autoUsername;
    let taken = await Seller.findOne({ username: _username });
    while (taken) {
      _username = autoUsername.replace(/-\d+$/, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      taken = await Seller.findOne({ username: _username });
    }
    const hash = await bcrypt.hash(password, 10);
    const seller = await Seller.create({
      fullName,
      username: _username,
      email,
      phone,
      shopName,
      address,
      bio,
      password: hash
    });

    const token = jwt.sign({ id: seller._id }, process.env.SELLER_JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      token,
      seller: {
        _id: seller._id,
        fullName: seller.fullName,
        username: seller.username,
        email: seller.email,
        phone: seller.phone,
        shopName: seller.shopName,
        address: seller.address,
        bio: seller.bio
      }
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// LOGIN
export async function login(req, res) {
  const { email, password } = req.body;
  const seller = await Seller.findOne({ email });
  if (!seller) return res.status(400).json({ error: "Invalid credentials" });
  const isMatch = await bcrypt.compare(password, seller.password);
  if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: seller._id }, process.env.SELLER_JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    seller: {
      _id: seller._id,
      fullName: seller.fullName,
      username: seller.username,
      email: seller.email,
      phone: seller.phone,
      shopName: seller.shopName,
      address: seller.address,
      bio: seller.bio
    }
  });
}

// GOOGLE LOGIN
export async function googleLogin(req, res) {
  const { email, fullName, googleId } = req.body;
  if (!email || !googleId) return res.status(400).json({ error: "Invalid request" });

  let seller = await Seller.findOne({ email });
  if (!seller) {
    let autoUsername = generateUsername(fullName || email.split("@")[0]);
    let _username = autoUsername;
    let taken = await Seller.findOne({ username: _username });
    while (taken) {
      _username = autoUsername.replace(/-\d+$/, "") + "-" + Math.floor(1000 + Math.random() * 9000);
      taken = await Seller.findOne({ username: _username });
    }
    seller = await Seller.create({
      fullName: fullName || email.split("@")[0],
      username: _username,
      email,
      phone: "",
      password: googleId + process.env.SELLER_JWT_SECRET
    });
  }
  const token = jwt.sign({ id: seller._id }, process.env.SELLER_JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    seller: {
      _id: seller._id,
      fullName: seller.fullName,
      username: seller.username,
      email: seller.email,
      phone: seller.phone,
      shopName: seller.shopName,
      address: seller.address,
      bio: seller.bio
    }
  });
}
