import express from "express";
import { adminAuth, superAdminOnly } from "../middlewares/adminAuth.js";
import { listUsersForAdmin } from "../controllers/adminUserController.js";

const router = express.Router();

router.get("/", adminAuth, superAdminOnly, listUsersForAdmin);

export default router;
