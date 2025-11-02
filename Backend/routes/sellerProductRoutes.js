import express from "express";
import sellerAuth from "../middlewares/sellerAuth.js";
import { list, add, addProductWithStock, getOne, update, remove } from "../controllers/sellerProductController.js";
const router = express.Router();

router.get('/', sellerAuth, list);                   // Seller get products
router.post('/', sellerAuth, add);                   // Seller add product
router.post('/with-stock', sellerAuth, addProductWithStock); // Alternate add
router.get('/:id', sellerAuth, getOne);              // Get single product
router.put('/:id', sellerAuth, update);              // Update
router.delete('/:id', sellerAuth, remove);           // Delete

export default router;
