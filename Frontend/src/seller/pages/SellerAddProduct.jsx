import React, { useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CATEGORY_LIST = [
  "fashion", "electronic", "furniture", "kitchen", "toys", "cosmetic", "food", "sports", "appliances"
];

export default function SellerAddProduct() {
  const { seller, token, logout } = useSellerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    stock: "",
    price: "",
    image: "",             // will be overridden by first image in images array on submit
    images: [""],          // Array of image URLs
    videos: [""],          // Array of video URLs
    delivery: ""
  });

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // For image/video arrays
  const handleArrayChange = (arrName, i, value) => {
    setForm({
      ...form,
      [arrName]: form[arrName].map((x, idx) => (i === idx ? value : x))
    });
  };
  const handleAddField = arrName => setForm({ ...form, [arrName]: [...form[arrName], ""] });
  const handleRemoveField = (arrName, i) => setForm({
    ...form,
    [arrName]: form[arrName].filter((_, idx) => i !== idx)
  });

  const handleSubmit = async e => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      if (!seller || !seller._id)
        throw new Error("Login required. Seller ID missing.");

      const imagesFiltered = form.images.filter(Boolean);
      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description,
        stock: Number(form.stock),
        price: Number(form.price),
        image: imagesFiltered[0] || "",          // Set main image to first in array if exists
        images: imagesFiltered,
        videos: form.videos.filter(Boolean),
        delivery: form.delivery,
        sellerId: seller._id
      };

      if (!payload.name || !payload.category ||
        isNaN(payload.stock) || isNaN(payload.price) ||
        payload.stock <= 0 || payload.price <= 0 || !payload.sellerId) {
        setErr("All fields must be filled and stock/price must be positive numbers.");
        setSaving(false);
        return;
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_URL}/api/sellers/products/with-stock`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/seller/products");
    } catch (e) {
      setErr(e.response?.data?.error || e.message || "Failed to add product. Try again.");
      if (e.response?.status === 401) logout();
    }
    setSaving(false);
  };

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen bg-[#f8f6fc] flex items-center justify-center">
        <form className="bg-white p-10 rounded-xl shadow-md w-full max-w-xl" onSubmit={handleSubmit}>
          <h2 className="mb-6 text-2xl font-bold text-[#440077]">Add New Product</h2>
          {err && <div className="mb-2 text-red-600">{err}</div>}
          <input type="text" name="name" value={form.name} onChange={handleChange}
            className="w-full p-3 mb-3 border rounded" placeholder="Product Name" required />
          <select name="category" value={form.category} onChange={handleChange}
            className="w-full p-3 mb-3 border rounded" required>
            <option value="">-- Select Category --</option>
            {CATEGORY_LIST.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <textarea name="description" value={form.description} onChange={handleChange}
            className="w-full p-3 mb-3 border rounded" placeholder="Description" />
          <input type="number" name="stock" value={form.stock} onChange={handleChange}
            className="w-full p-3 mb-3 border rounded" placeholder="Stock" min="1" required />
          <input type="number" name="price" value={form.price} onChange={handleChange}
            className="w-full p-3 mb-3 border rounded" placeholder="Price" min="1" required />

          {/* Old image field (backward compatible, but not used as main image) */}
          <input type="text" name="image" value={form.image} onChange={handleChange}
            className="w-full p-3 mb-3 border rounded" placeholder="(Optional) Main Image URL" disabled />

          {/* Array images */}
          <div className="mb-3">
            <label className="block mb-2 font-medium">Product Images (URLs)</label>
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={img}
                  onChange={e => handleArrayChange("images", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder={`Image URL ${i + 1}`}
                />
                {form.images.length > 1 && (
                  <button type="button" onClick={() => handleRemoveField("images", i)} className="text-red-500 font-bold">X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => handleAddField("images")} className="text-blue-600 font-medium mt-1">
              + Add Image
            </button>
          </div>

          {/* Array videos */}
          <div className="mb-3">
            <label className="block mb-2 font-medium">Product Videos (URLs)</label>
            {form.videos.map((vid, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input type="text" value={vid}
                  onChange={e => handleArrayChange("videos", i, e.target.value)}
                  className="flex-1 p-2 border rounded"
                  placeholder={`Video URL ${i + 1}`}
                />
                {form.videos.length > 1 && (
                  <button type="button" onClick={() => handleRemoveField("videos", i)} className="text-red-500 font-bold">X</button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => handleAddField("videos")} className="text-blue-600 font-medium mt-1">
              + Add Video
            </button>
          </div>

          <input type="text" name="delivery" value={form.delivery} onChange={handleChange}
            className="w-full p-3 mb-3 border rounded" placeholder="Delivery Info" />
          <button type="submit" disabled={saving}
            className="w-full bg-[#440077] text-yellow-200 py-2 rounded font-bold hover:bg-yellow-400 hover:text-[#440077] transition">
            {saving ? "Saving..." : "Add Product"}
          </button>
        </form>
      </div>
    </>
  );
}
