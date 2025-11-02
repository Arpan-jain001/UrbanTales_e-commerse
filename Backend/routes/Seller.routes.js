import express from "express";
import { signup, login } from "../controllers/sellerAuthController.js";
import sellerValidate from "../middlewares/sellerValidate.js";
import sellerAuth from "../middlewares/sellerAuth.js";
import Seller from "../models/Seller.js";

const router = express.Router();

router.post('/auth/signup', sellerValidate(["fullName", "email", "password"]), signup);
router.post('/auth/login', sellerValidate(["email", "password"]), login);

// Profile route - returns seller object from DB
router.get('/profile', sellerAuth, async (req, res) => {
  console.log("Profile request for seller:", req.seller); // debug log
  res.json(req.seller);
});

export default router;
