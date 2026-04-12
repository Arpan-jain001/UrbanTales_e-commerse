import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { getMyGiftCardWallet, validateGiftCard } from "../controllers/giftCardController.js";

const router = express.Router();

router.get("/wallet", verifyToken, getMyGiftCardWallet);
router.post("/validate", verifyToken, validateGiftCard);

export default router;
