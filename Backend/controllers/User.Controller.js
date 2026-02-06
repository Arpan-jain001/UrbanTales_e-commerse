import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { adminAuth } from "../firebaseAdmin.js";
import { sendWelcomeMail } from "../utils/sendWelcomeMail.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecretKey";

// =============================
// ✅ Manual Signup Controller
// =============================
export const signup = async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
    });

    await user.save();

    // ✅ Welcome email
    try {
      await sendWelcomeMail(email, fullName);
      console.log(`✅ Welcome email sent to ${email}`);
    } catch (mailError) {
      console.error("⚠️ Failed to send welcome email:", mailError.message);
    }

    return res.status(201).json({
      message: "User created successfully.",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// =============================
// ✅ Manual Login Controller
// =============================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password." });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// =============================
// ✅ Firebase Google Login
// =============================
export const googleFirebaseLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, phone_number } = decodedToken;

    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        fullName: name,
        email,
        phone: phone_number || "N/A",
        password: uid, // temporary
      });
      isNewUser = true;
    }

    const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    if (isNewUser) {
      try {
        await sendWelcomeMail(user.email, user.fullName);
        console.log(`✅ Google signup welcome email sent to ${email}`);
      } catch (mailError) {
        console.error("⚠️ Failed to send Google welcome email:", mailError.message);
      }
    }

    return res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      user,
    });
  } catch (err) {
    console.error("Firebase Google Auth Error:", err);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};

// =============================
// ✅ OLD Update Profile (KEEP)
// Supports:
// - old flow (array address)
// - new flow (bio/dob/gender/profileImage)
// - address string (convert to array safely)
// =============================
export const updateProfile = async (req, res) => {
  const userId = req.userId;

  const {
    fullName,
    phone,
    address,

    // ✅ new fields (optional)
    bio,
    dob,
    gender,
    profileImage,
  } = req.body;

  try {
    const updateDoc = {};

    if (typeof fullName !== "undefined") updateDoc.fullName = fullName;
    if (typeof phone !== "undefined") updateDoc.phone = phone;

    if (typeof bio !== "undefined") updateDoc.bio = bio;
    if (typeof dob !== "undefined") updateDoc.dob = dob;
    if (typeof gender !== "undefined") updateDoc.gender = gender;
    if (typeof profileImage !== "undefined") updateDoc.profileImage = profileImage;

    // ✅ address supports BOTH array and string
    if (typeof address !== "undefined") {
      if (typeof address === "string") {
        const str = address.trim(); // even 1 char ok
        updateDoc.address = str
          ? [{ street: str, city: "", pincode: "", tag: "Home" }]
          : [];
      } else if (Array.isArray(address)) {
        updateDoc.address = address;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateDoc, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: err.message });
  }
};
