import User from "../models/user.js";
import Product from "../models/product.js";

export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate({
      path: "wishlist",
      select: "name price image images category availableSizes availableColors stock",
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ wishlist: user.wishlist || [] });
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

export const addWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const product = await Product.findById(productId).select("_id");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const exists = user.wishlist?.some((item) => item.toString() === productId);
    if (exists) {
      return res.status(200).json({ message: "Product already in wishlist" });
    }

    user.wishlist = [...(user.wishlist || []), productId];
    await user.save();

    return res.status(201).json({ message: "Added to wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("Add wishlist item error:", err);
    return res.status(500).json({ message: "Failed to add wishlist item" });
  }
};

export const removeWishlistItem = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.wishlist = (user.wishlist || []).filter((item) => item.toString() !== productId);
    await user.save();

    return res.status(200).json({ message: "Removed from wishlist", wishlist: user.wishlist });
  } catch (err) {
    console.error("Remove wishlist item error:", err);
    return res.status(500).json({ message: "Failed to remove wishlist item" });
  }
};
