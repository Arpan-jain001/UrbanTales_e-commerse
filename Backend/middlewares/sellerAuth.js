import jwt from "jsonwebtoken";
import Seller from "../models/Seller.js";

const sellerAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Not authenticated" });
    const decoded = jwt.verify(token, process.env.SELLER_JWT_SECRET); // use SELLER_JWT_SECRET!
    const seller = await Seller.findById(decoded.id);
    if (!seller) return res.status(401).json({ error: "Seller not found" });
    req.seller = seller;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};
export default sellerAuth;
