import { signup, login, googleLogin } from "../controllers/sellerAuthController.js";
import express from "express";
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google-login', googleLogin);

export default router;
