import express from "express";
import { uploadToCloudinary } from "../controllers/uploadController.js";

const router = express.Router();

// POST /api/upload
router.post("/", uploadToCloudinary);

export default router;
