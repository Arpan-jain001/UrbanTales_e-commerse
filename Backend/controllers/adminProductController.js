import Product from "../models/product.js";

/**
 * Get all products for admin with pagination and filters
 * GET /api/admin/products
 */
export const listProductsForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category || "";
    const status = req.query.status || "ALL";

    // Build query
    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    if (status === "ACTIVE") {
      query.stock = { $gt: 0 };
    } else if (status === "OUT_OF_STOCK") {
      query.stock = 0;
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate("sellerId", "shopName fullName email phone") // ← SELLER POPULATE
        .select("name category price stock image images createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("listProductsForAdmin error:", err);
    return res.status(500).json({ 
      success: false,
      message: "Failed to fetch products" 
    });
  }
};

/**
 * Delete product by ID (Admin only)
 * DELETE /api/admin/products/:productId
 */
export const deleteProductByAdmin = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    await Product.findByIdAndDelete(productId);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: {
        id: product._id,
        name: product.name,
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting product" 
    });
  }
};

/**
 * Update product by ID (Admin only)
 * PUT /api/admin/products/:productId
 */
export const updateProductByAdmin = async (req, res) => {
  try {
    const { productId } = req.params;
    const updates = req.body;

    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("sellerId", "shopName fullName email");

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error while updating product" 
    });
  }
};
