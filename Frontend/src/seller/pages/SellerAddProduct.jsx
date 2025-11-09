// D:\UrbanTales-Website\Frontend\src\seller\pages\SellerAddProduct.jsx
import React, { useState, useRef } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CATEGORY_LIST = [
  "fashion",
  "electronic",
  "furniture",
  "kitchen",
  "toys",
  "cosmetic",
  "food",
  "sports",
  "appliances",
];

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function SellerAddProduct() {
  const { seller, token, logout } = useSellerAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    stock: "",
    price: "",
    images: [], // array of urls
    videos: [], // array of urls
    delivery: "",
    showFirst: "image", // "image" or "video"
  });

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState("upload"); // "upload" or "url"
  const [videoMode, setVideoMode] = useState("upload"); // "upload" or "url"
  const [dragOver, setDragOver] = useState(false);
  const dropRef = useRef();

  // helpers
  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Add URL entry (images/videos)
  const addUrl = (arrName, url) => {
    if (!url) return;
    setForm((s) => ({ ...s, [arrName]: [...s[arrName], url] }));
  };

  // Remove item
  const removeAt = (arrName, index) => {
    setForm((s) => ({ ...s, [arrName]: s[arrName].filter((_, i) => i !== index) }));
  };

  // Move item left/right (reorder)
  const moveItem = (arrName, idx, dir) => {
    setForm((s) => {
      const arr = [...s[arrName]];
      const newIndex = dir === "left" ? idx - 1 : idx + 1;
      if (newIndex < 0 || newIndex >= arr.length) return s; // no change
      const tmp = arr[newIndex];
      arr[newIndex] = arr[idx];
      arr[idx] = tmp;
      return { ...s, [arrName]: arr };
    });
  };

  // Upload file to backend upload endpoint (expects { url })
  const uploadToServer = async (file, arrName) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = res.data.url || res.data.secure_url || "";
      if (!url) throw new Error("Invalid upload response");
      setForm((s) => ({ ...s, [arrName]: [...s[arrName], url] }));
    } catch (e) {
      console.error("Upload error:", e);
      setErr("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  // Handle file input (single file) for images/videos
  const handleFileInput = (e, arrName) => {
    const file = e.target.files?.[0];
    if (file) uploadToServer(file, arrName);
    e.target.value = ""; // reset input
  };

  // Drag & drop handlers (drop uploads into images area)
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  };
  const handleDrop = (e, arrName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []);
    // Upload all files sequentially
    files.forEach((f) => uploadToServer(f, arrName));
  };

  // Main submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);

    try {
      if (!seller || !seller._id) throw new Error("Login required.");

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description,
        stock: Number(form.stock),
        price: Number(form.price),
        image: form.images[0] || "",
        images: form.images,
        videos: form.videos,
        delivery: form.delivery,
        sellerId: seller._id,
        showFirst: form.showFirst,
      };

      // validation
      if (
        !payload.name ||
        !payload.category ||
        !payload.stock ||
        !payload.price ||
        isNaN(payload.stock) ||
        isNaN(payload.price) ||
        payload.stock <= 0 ||
        payload.price <= 0
      ) {
        setErr("Please fill all required fields with valid values.");
        setSaving(false);
        return;
      }

      await axios.post(
        `${API_BASE}/api/sellers/products/with-stock`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate("/seller/products");
    } catch (e) {
      console.error(e);
      setErr(e.response?.data?.error || e.message || "Failed to add product.");
      if (e.response?.status === 401) logout();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen bg-[#f8f6fc] flex items-center justify-center py-12 px-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-4xl"
        >
          <h2 className="text-2xl font-bold text-[#440077] mb-4">Add New Product</h2>

          {err && <div className="text-red-600 mb-3">{err}</div>}

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Product Name"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="p-3 border rounded"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setField("category", e.target.value)}
              className="p-3 border rounded"
              required
            >
              <option value="">-- Select Category --</option>
              {CATEGORY_LIST.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock"
              min="1"
              value={form.stock}
              onChange={(e) => setField("stock", e.target.value)}
              className="p-3 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Price"
              min="1"
              value={form.price}
              onChange={(e) => setField("price", e.target.value)}
              className="p-3 border rounded"
              required
            />
          </div>

          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            className="w-full p-3 border rounded mt-3"
          />

          {/* IMAGES SECTION */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#440077]">Images</h3>
              <div className="text-sm text-gray-600">Choose upload method</div>
            </div>

            <div className="flex gap-4 mt-2 items-center">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="imageMode"
                  checked={imageMode === "upload"}
                  onChange={() => setImageMode("upload")}
                />
                Upload
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="imageMode"
                  checked={imageMode === "url"}
                  onChange={() => setImageMode("url")}
                />
                URL
              </label>
            </div>

            {imageMode === "upload" ? (
              <div
                ref={dropRef}
                onDragOver={handleDragOver}
                onDragEnter={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, "images")}
                className={`mt-3 p-4 border-2 rounded border-dashed ${
                  dragOver ? "border-[#440077] bg-[#f9f7ff]" : "border-gray-200"
                }`}
              >
                <div className="flex gap-3 items-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileInput(e, "images")}
                    className="block"
                  />
                  <p className="text-sm text-gray-600">
                    Drag & drop images here or click to choose. (Multiple uploads supported)
                  </p>
                </div>

                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}

                <div className="flex flex-wrap gap-3 mt-4">
                  {form.images.map((url, i) => (
                    <div key={i} className="w-28">
                      <img src={url} alt={`img-${i}`} className="w-28 h-28 object-cover rounded" />
                      <div className="flex items-center justify-between mt-1">
                        <button
                          type="button"
                          onClick={() => moveItem("images", i, "left")}
                          className="text-xs px-1"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={() => removeAt("images", i)}
                          className="text-xs text-red-600 px-1"
                        >
                          Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => moveItem("images", i, "right")}
                          className="text-xs px-1"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input id="img-url-input" type="text" placeholder="Paste image URL and press Add" className="p-2 border rounded flex-1" />
                  <button
                    type="button"
                    className="px-3 py-2 bg-[#440077] text-white rounded"
                    onClick={() => {
                      const el = document.getElementById("img-url-input");
                      if (el?.value) {
                        addUrl("images", el.value.trim());
                        el.value = "";
                      }
                    }}
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {form.images.map((url, i) => (
                    <div key={i} className="w-28">
                      <img src={url} alt={`img-${i}`} className="w-28 h-28 object-cover rounded" />
                      <div className="flex items-center justify-between mt-1">
                        <button type="button" onClick={() => moveItem("images", i, "left")} className="text-xs px-1">◀</button>
                        <button type="button" onClick={() => removeAt("images", i)} className="text-xs text-red-600 px-1">Remove</button>
                        <button type="button" onClick={() => moveItem("images", i, "right")} className="text-xs px-1">▶</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* VIDEOS SECTION */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[#440077]">Videos</h3>
              <div className="text-sm text-gray-600">Choose upload method</div>
            </div>

            <div className="flex gap-4 mt-2 items-center">
              <label className="flex items-center gap-2">
                <input type="radio" name="videoMode" checked={videoMode === "upload"} onChange={() => setVideoMode("upload")} />
                Upload
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="videoMode" checked={videoMode === "url"} onChange={() => setVideoMode("url")} />
                URL
              </label>
            </div>

            {videoMode === "upload" ? (
              <div className="mt-3 p-4 border-2 rounded border-dashed border-gray-200">
                <div className="flex gap-3 items-center">
                  <input type="file" accept="video/*" onChange={(e) => handleFileInput(e, "videos")} />
                  <p className="text-sm text-gray-600">Upload video file (mp4, webm). Large files upload may take time.</p>
                </div>

                {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}

                <div className="flex flex-wrap gap-3 mt-4">
                  {form.videos.map((url, i) => (
                    <div key={i} className="w-40">
                      <video src={url} controls className="w-40 h-24 rounded object-cover" />
                      <div className="flex items-center justify-between mt-1">
                        <button type="button" onClick={() => moveItem("videos", i, "left")} className="text-xs px-1">◀</button>
                        <button type="button" onClick={() => removeAt("videos", i)} className="text-xs text-red-600 px-1">Remove</button>
                        <button type="button" onClick={() => moveItem("videos", i, "right")} className="text-xs px-1">▶</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex gap-2">
                  <input id="vid-url-input" type="text" placeholder="Paste video URL and press Add" className="p-2 border rounded flex-1" />
                  <button type="button" className="px-3 py-2 bg-[#440077] text-white rounded" onClick={() => {
                    const el = document.getElementById("vid-url-input");
                    if (el?.value) { addUrl("videos", el.value.trim()); el.value = ""; }
                  }}>Add</button>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {form.videos.map((url, i) => (
                    <div key={i} className="w-40">
                      <video src={url} controls className="w-40 h-24 rounded object-cover" />
                      <div className="flex items-center justify-between mt-1">
                        <button type="button" onClick={() => moveItem("videos", i, "left")} className="text-xs px-1">◀</button>
                        <button type="button" onClick={() => removeAt("videos", i)} className="text-xs text-red-600 px-1">Remove</button>
                        <button type="button" onClick={() => moveItem("videos", i, "right")} className="text-xs px-1">▶</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Display preference */}
          <div className="mt-6">
            <label className="font-semibold text-[#440077]">Display Preference</label>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="showFirst" value="image" checked={form.showFirst === "image"} onChange={(e) => setField("showFirst", e.target.value)} />
                Show image first
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="showFirst" value="video" checked={form.showFirst === "video"} onChange={(e) => setField("showFirst", e.target.value)} />
                Show video first
              </label>
            </div>
          </div>

          <input
            type="text"
            placeholder="Delivery info (eg: Ships in 3-5 working days)"
            value={form.delivery}
            onChange={(e) => setField("delivery", e.target.value)}
            className="w-full p-3 border rounded mt-4"
          />

          <button
            type="submit"
            disabled={saving || uploading}
            className="w-full mt-6 bg-[#440077] text-yellow-200 py-2 rounded font-bold hover:bg-yellow-400 hover:text-[#440077] transition"
          >
            {saving ? "Saving..." : "Add Product"}
          </button>
        </form>
      </div>
    </>
  );
}
