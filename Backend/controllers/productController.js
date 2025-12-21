import Product from "../models/product.js";

// GET products by category: /api/products/:category
export const listByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log('🔍 Searching category:', category); // Debug log
    
    const products = await Product.find({ 
      category: new RegExp(`^${category}$`, 'i') 
    }).sort({ createdAt: -1 });
    
    console.log('📦 Found:', products.length, 'products'); // Debug log
    res.status(200).json(products);
  } catch (e) {
    console.error('❌ Category error:', e);
    res.status(500).json({ message: "Cannot fetch products" });
  }
};

// GET single product: /api/products/id/:id
export const getOne = async (req, res) => {
  try {
    const { id } = req.params;  // ✅ Fixed: req.params.id -> req.params.id
    const prod = await Product.findById(id);
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(prod);
  } catch (e) {
    console.error('❌ Product error:', e);
    res.status(500).json({ message: "Cannot get product" });
  }
};
