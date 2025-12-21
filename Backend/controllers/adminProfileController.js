import Admin from "../models/Admin.js";

function calculateProfileCompletion(admin) {
  const fields = ["phone", "avatar", "designation", "bio"];
  let filled = 0;
  fields.forEach(f => {
    if (admin[f] && admin[f].toString().trim() !== "") filled++;
  });
  return Math.round((filled / fields.length) * 100);
}

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).lean();
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const completion = calculateProfileCompletion(admin);

    res.status(200).json({
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        phone: admin.phone || "",
        avatar: admin.avatar || "",
        designation: admin.designation || "",
        bio: admin.bio || "",
      },
      completion,
    });
  } catch (err) {
    console.error("getAdminProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { fullName, phone, avatar, designation, bio } = req.body;

    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (fullName !== undefined) admin.fullName = fullName;
    if (phone !== undefined) admin.phone = phone;
    if (avatar !== undefined) admin.avatar = avatar;
    if (designation !== undefined) admin.designation = designation;
    if (bio !== undefined) admin.bio = bio;

    await admin.save();

    const completion = calculateProfileCompletion(admin);

    res.status(200).json({
      message: "Profile updated",
      completion,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        phone: admin.phone || "",
        avatar: admin.avatar || "",
        designation: admin.designation || "",
        bio: admin.bio || "",
      },
    });
  } catch (err) {
    console.error("updateAdminProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
