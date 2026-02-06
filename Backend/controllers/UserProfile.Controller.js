import User from "../models/user.js";

// ✅ GET my profile (backend source of truth)
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("Get Profile Error:", err);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ✅ helper: string => address array (comma split; 1 char also ok)
const stringToAddressArray = (addressStr) => {
  const str = (addressStr || "").trim();
  if (!str) return [];

  const parts = str.split(",").map((s) => s.trim()).filter(Boolean);

  return [
    {
      street: parts[0] || str,
      city: parts[1] || "",
      pincode: parts[2] || "",
      tag: "Home",
    },
  ];
};

// ✅ UPDATE my profile (extended fields + string address support)
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      fullName,
      phone,
      bio,
      dob,
      gender,
      profileImage,

      // can be STRING or ARRAY (we support both)
      address,
    } = req.body;

    const update = {};

    if (typeof fullName !== "undefined") update.fullName = fullName;
    if (typeof phone !== "undefined") update.phone = phone;

    if (typeof bio !== "undefined") update.bio = bio;
    if (typeof dob !== "undefined") update.dob = dob;
    if (typeof gender !== "undefined") update.gender = gender;
    if (typeof profileImage !== "undefined") update.profileImage = profileImage;

    if (typeof address !== "undefined") {
      if (typeof address === "string") {
        update.address = stringToAddressArray(address);
      } else if (Array.isArray(address)) {
        update.address = address;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update My Profile Error:", err);
    return res.status(500).json({ message: err.message || "Update failed" });
  }
};
