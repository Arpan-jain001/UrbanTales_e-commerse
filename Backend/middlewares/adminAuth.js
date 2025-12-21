import Admin from "../models/Admin.js";
import { verifyAdminToken } from "../utils/adminJwt.js";

export const adminAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      return res.status(401).json({ message: "Admin token missing" });

    const token = header.split(" ")[1];
    const decoded = verifyAdminToken(token);

    const admin = await Admin.findById(decoded.id);
    if (!admin) return res.status(401).json({ message: "Admin not found" });

    req.admin = admin;
    next();
  } catch (err) {
    console.error("adminAuth error:", err);
    res.status(401).json({ message: "Invalid admin token" });
  }
};

// Only SUPER_ADMIN
export const superAdminOnly = (req, res, next) => {
  if (!req.admin || req.admin.role !== "SUPER_ADMIN") {
    return res.status(403).json({ message: "Super admin only" });
  }
  next();
};
