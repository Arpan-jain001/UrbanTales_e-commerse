import jwt from "jsonwebtoken";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "adminSuperSecretKey";

export function signAdminJwt(admin) {
  return jwt.sign(
    { id: admin._id, role: admin.role },
    ADMIN_JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyAdminToken(token) {
  return jwt.verify(token, ADMIN_JWT_SECRET);
}
