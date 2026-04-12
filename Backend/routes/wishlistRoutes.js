import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { getWishlist, addWishlistItem, removeWishlistItem } from "../controllers/wishlistController.js";

const router = express.Router();

router.get("/", verifyToken, getWishlist);
router.post("/", verifyToken, addWishlistItem);
router.delete("/:productId", verifyToken, removeWishlistItem);

export default router;
