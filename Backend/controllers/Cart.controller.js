import Cart from "../models/Cart.js";

const buildCartItemKey = (item) =>
  [item.id, item.selectedSize || "", item.selectedColor || ""].join("::");

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    const subtotal =
      cart?.items?.reduce((sum, item) => sum + item.price * item.qty, 0) || 0;
    if (!cart) return res.status(200).json({ items: [], subtotal: 0 });
    res.status(200).json({ items: cart.items, subtotal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const addToCart = async (req, res) => {
  const { item } = req.body;
  try {
    const normalizedItem = {
      id: item.id,
      sellerId: item.sellerId || "",
      name: item.name || "",
      price: Number(item.price || 0),
      image: item.image || item.selectedColorImage || "",
      qty: Number(item.qty || 1),
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
      selectedColorImage: item.selectedColorImage || "",
    };

    let cart = await Cart.findOne({ userId: req.userId });
    if (!cart) {
      cart = new Cart({ userId: req.userId, items: [normalizedItem] });
    } else {
      const key = buildCartItemKey(normalizedItem);
      const existingItem = cart.items.find((cartItem) => buildCartItemKey(cartItem) === key);
      if (existingItem) existingItem.qty += normalizedItem.qty;
      else cart.items.push(normalizedItem);
    }
    await cart.save();
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    res.status(200).json({ msg: "Item added", cart, subtotal });
  } catch (err) {
    console.error("Add to cart failed:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const removeFromCart = async (req, res) => {
  const { itemId, selectedSize = "", selectedColor = "" } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });
    cart.items = cart.items.filter(
      (item) =>
        !(
          item.id === itemId &&
          String(item.selectedSize || "") === String(selectedSize || "") &&
          String(item.selectedColor || "") === String(selectedColor || "")
        )
    );
    await cart.save();
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    res.status(200).json({ msg: "Item removed", cart, subtotal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateQtyInCart = async (req, res) => {
  const { itemId, qty, selectedSize = "", selectedColor = "" } = req.body;
  try {
    const cart = await Cart.findOne({ userId: req.userId });
    if (!cart) return res.status(404).json({ msg: "Cart not found" });
    const item = cart.items.find(
      (cartItem) =>
        cartItem.id === itemId &&
        String(cartItem.selectedSize || "") === String(selectedSize || "") &&
        String(cartItem.selectedColor || "") === String(selectedColor || "")
    );
    if (!item) return res.status(404).json({ msg: "Item not found" });
    item.qty = Number(qty);
    await cart.save();
    const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0);
    res.status(200).json({ msg: "Quantity updated", cart, subtotal });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.userId }, { $set: { items: [] } });
    res.status(200).json({ msg: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
