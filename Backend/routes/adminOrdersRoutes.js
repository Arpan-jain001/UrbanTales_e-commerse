import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import { listOrdersForAdmin } from "../controllers/adminOrderController.js";

const router = express.Router();

// GET /api/admin/orders?page=&limit=
router.get("/", adminAuth, superAdminOnly, listOrdersForAdmin);

export default router;
