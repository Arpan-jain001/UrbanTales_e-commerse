import jwt from "jsonwebtoken";

export function signSellerJwt(seller) {
  return jwt.sign(
    { id: seller._id },
    process.env.SELLER_JWT_SECRET,
    { expiresIn: "30d" }
  );
}
