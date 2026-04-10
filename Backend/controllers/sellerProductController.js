import Product from "../models/product.js";

const normalizeSizes = (sizes = []) =>
  Array.from(
    new Set(
      (Array.isArray(sizes) ? sizes : [])
        .map((size) => String(size || "").trim())
        .filter(Boolean)
    )
  );

const normalizeColors = (colors = []) =>
  (Array.isArray(colors) ? colors : [])
    .map((color) => ({
      name: String(color?.name || "").trim(),
      image: String(color?.image || "").trim(),
    }))
    .filter((color) => color.name);

const buildPayload = (body, sellerId) => ({
  sellerId,
  name: String(body.name || "").trim(),
  category: String(body.category || "").trim(),
  subCategory: String(body.subCategory || "").trim(),
  description: body.description || "",
  stock: Number(body.stock || 0),
  price: Number(body.price || 0),
  originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
  image: body.image || "",
  images: Array.isArray(body.images) ? body.images : [],
  videos: Array.isArray(body.videos) ? body.videos : [],
  delivery: body.delivery || "",
  mediaOrder: Array.isArray(body.mediaOrder) ? body.mediaOrder : [],
  availableSizes: normalizeSizes(body.availableSizes),
  availableColors: normalizeColors(body.availableColors),
});

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

export const add = async (req, res) => {
  try {
    const payload = buildPayload(req.body, req.seller._id);
    if (!payload.name || !payload.category || !payload.stock || !payload.price) {
      return res.status(400).json({ message: "All required fields must be provided!" });
    }

    const product = new Product(payload);
    await product.save();
    res.status(201).json(product);
  } catch (e) {
    console.error("Add product failed:", e);
    res.status(500).json({ message: "Failed to add product" });
  }
};

export const addProductWithStock = add;

export const getOne = async (req, res) => {
  try {
    const prod = await Product.findOne({ _id: req.params.id, sellerId: req.seller._id });
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(prod);
  } catch (e) {
    res.status(500).json({ message: "Failed to get product" });
  }
};

export const update = async (req, res) => {
  try {
    const prod = await Product.findOne({ _id: req.params.id, sellerId: req.seller._id });
    if (!prod) return res.status(404).json({ message: "Product not found" });

    const payload = buildPayload({ ...prod.toObject(), ...req.body }, req.seller._id);
    Object.assign(prod, payload);
    await prod.save();
    res.status(200).json(prod);
  } catch (e) {
    console.error("Update product failed:", e);
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const remove = async (req, res) => {
  try {
    const prod = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.seller._id });
    if (!prod) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (e) {
    res.status(500).json({ message: "Failed to delete product" });
  }
};
