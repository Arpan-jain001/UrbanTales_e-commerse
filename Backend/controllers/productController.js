import Product from "../models/product.js";

// GET /api/products/:category
export const listByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category: new RegExp(`^${category}$`, 'i') }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ message: "Cannot fetch products" });
  }
};

// GET /api/products/id/:id
export const getOne = async (req, res) => {
  try {
    const _id = req.params.id;
    const prod = await Product.findById(_id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(prod);
  } catch (e) {
    res.status(500).json({ message: "Cannot get product" });
  }
};
