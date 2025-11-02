import express from "express";
import { listByCategory, getOne } from "../controllers/productController.js";
const router = express.Router();

router.get('/:category', listByCategory); // GET /api/products/fashion
router.get('/id/:id', getOne);            // GET /api/products/id/...

export default router;
