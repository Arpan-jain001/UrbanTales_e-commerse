import Product from "../models/Product.js";

// GET /api/sellers/products
export const list = async (req, res) => {
  try {
    const filter = { sellerId: req.seller._id };
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (e) {
    res.status(500).json({ message: "Failed to list products" });
  }
};

// POST /api/sellers/products
export const add = async (req, res) => {
  try {
    const { name, category, description, stock, price, image, delivery } = req.body;
    if (!name || !category || !stock || !price) {
      return res.status(400).json({ message: "All required fields must be provided!" });
    }
    const product = new Product({
      sellerId: req.seller._id,
      name,
      category,
      description,
      stock,
      price,
      image,
      delivery
    });
    await product.save();
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: "Failed to add product" });
  }
};

// Optionally POST /api/sellers/products/with-stock
export const addProductWithStock = async (req, res) => {
  try {
    const { name, category, description, stock, price, image, delivery } = req.body;
    if (!name || !category || !stock || !price) {
      return res.status(400).json({ message: "All required fields must be provided!" });
    }
    const product = new Product({
      sellerId: req.seller._id,
      name,
      category,
      description,
      stock,
      price,
      image,
      delivery
    });
    await product.save();
    res.status(201).json(product);
  } catch (e) {
    res.status(500).json({ message: "Failed to add product" });
  }
};

// GET /api/sellers/products/:id
export const getOne = async (req, res) => {
  try {
    const prod = await Product.findOne({ _id: req.params.id, sellerId: req.seller._id });
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(prod);
  } catch (e) {
    res.status(500).json({ message: "Failed to get product" });
  }
};

// PUT /api/sellers/products/:id
export const update = async (req, res) => {
  try {
    const prod = await Product.findOne({ _id: req.params.id, sellerId: req.seller._id });
    if (!prod) return res.status(404).json({ message: "Product not found" });
    Object.assign(prod, req.body);
    await prod.save();
    res.status(200).json(prod);
  } catch (e) {
    res.status(500).json({ message: "Failed to update product" });
  }
};

// DELETE /api/sellers/products/:id
export const remove = async (req, res) => {
  try {
    const prod = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.seller._id });
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};
