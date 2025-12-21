// routes/adminSellersRoutes.js
import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import { listSellersForAdmin } from "../controllers/adminSellerController.js";

const router = express.Router();

// GET /api/admin/sellers?page=&limit=
router.get("/", adminAuth, superAdminOnly, listSellersForAdmin);

export default router;
