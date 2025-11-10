import React, { useState, useRef, useEffect } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaArrowLeft,
  FaArrowRight,
  FaSpinner,
  FaRegImage,
  FaRegPlayCircle,
  FaImages,
  FaLink,
  FaCloudUploadAlt,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";

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

// Album modal (shared UI)
function AlbumModal({ isOpen, onClose, onPick, initialTab = "image" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // { url, type }
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    if (!isOpen) return;
    const fetchLibrary = async () => {
      try {
        setLoading(true);
        const { data } = await axios
          .get(`${API_BASE}/api/media/library`, { params: { type: activeTab } })
          .catch(() => ({ data: [] }));
        const list = Array.isArray(data) ? data : [];
        setItems(list.filter((x) => x?.url && x?.type));
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [isOpen, activeTab]);

  const toggleSelect = (url) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  };

  const confirm = () => {
    if (selected.size === 0) return onClose();
    onPick(
      items
        .filter((i) => selected.has(i.url))
        .map((i) => ({ type: i.type, url: i.url }))
    );
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 16 }}
        className="relative w-full max-w-4xl rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/40"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/50">
          <div className="flex items-center gap-3 text-xl font-extrabold text-[#2a0055]">
            <FaImages /> Media Library
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 active:scale-95" aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="inline-flex rounded-2xl overflow-hidden border bg-white/60">
            {[
              { key: "image", label: "Images", icon: <FaRegImage /> },
              { key: "video", label: "Videos", icon: <FaRegPlayCircle /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition ${
                  activeTab === t.key ? "bg-[#2a0055] text-white" : "hover:bg-black/5"
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-500">
              <FaSpinner className="animate-spin mr-2" /> Loading...
            </div>
          ) : items.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-16">
              No media found. (If API not ready, you can still upload.)
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items
                .filter((i) => i.type === activeTab)
                .map((m) => (
                  <button
                    type="button"
                    key={m.url}
                    onClick={() => toggleSelect(m.url)}
                    className={`relative group border rounded-2xl overflow-hidden bg-white/60 backdrop-blur transition hover:shadow-lg active:scale-[.99] ${
                      selected.has(m.url) ? "ring-2 ring-[#2a0055]" : ""
                    }`}
                  >
                    {m.type === "image" ? (
                      <img src={m.url} alt="preview" className="w-full h-28 object-cover" loading="lazy" />
                    ) : (
                      <video src={m.url} className="w-full h-28 object-cover bg-black" />
                    )}
                    {selected.has(m.url) && (
                      <div className="absolute top-2 right-2 bg-[#2a0055] text-white rounded-full p-1 text-xs">
                        <FaCheck />
                      </div>
                    )}
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 pt-0">
          <div className="text-xs text-gray-500">{selected.size} selected</div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-xl border bg-white/70 backdrop-blur hover:bg-white/90">
              Cancel
            </button>
            <button onClick={confirm} className="px-5 py-2 rounded-xl font-bold bg-[#2a0055] text-white shadow hover:shadow-md active:scale-95">
              Add Selected
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function SellerEditProduct() {
  const { seller, token, logout } = useSellerAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [imageMode, setImageMode] = useState("upload"); // upload | url | album
  const [videoMode, setVideoMode] = useState("upload");
  const [autoArrange, setAutoArrange] = useState(true);
  const [mediaOrder, setMediaOrder] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const [showAlbum, setShowAlbum] = useState(false);
  const [albumType, setAlbumType] = useState("image");

  const dragItem = useRef();
  const dragOverItem = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/sellers/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        const images = data.images || [];
        const videos = data.videos || [];
        setForm({ ...data, images, videos, delivery: data.delivery || "" });
        setMediaOrder(
          data.mediaOrder || [
            ...images.map((u) => ({ type: "image", url: u })),
            ...videos.map((u) => ({ type: "video", url: u })),
          ]
        );
      } catch (e) {
        setErr("Product not found");
      }
    };
    load();
  }, [id, token]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // upload helpers
  const uploadFile = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000,
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });
      return res.data.url || res.data.secure_url || null;
    } catch (e) {
      toast.error("Upload failed. Try again.");
      return null;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 400);
    }
  };

  const handleFilesChange = async (e, type) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = [];
    for (const f of files) {
      const u = await uploadFile(f);
      if (u) urls.push(u);
    }
    if (!urls.length) return;
    if (type === "image") setField("images", [...form.images, ...urls]);
    else setField("videos", [...form.videos, ...urls]);
  };

  const addUrl = (type, url) => {
    if (!url) return;
    if (type === "image") setField("images", [...form.images, url]);
    else setField("videos", [...form.videos, url]);
  };

  const addFromAlbum = (picked) => {
    if (!Array.isArray(picked) || picked.length === 0) return;
    const imgUrls = picked.filter((p) => p.type === "image").map((p) => p.url);
    const vidUrls = picked.filter((p) => p.type === "video").map((p) => p.url);
    if (imgUrls.length) setField("images", [...form.images, ...imgUrls]);
    if (vidUrls.length) setField("videos", [...form.videos, ...vidUrls]);
  };

  // merge helpers
  const buildAutoMerged = () => {
    const imgs = [...(form?.images || [])];
    const vids = [...(form?.videos || [])];
    const merged = [];
    let i = 0,
      v = 0;
    let turn = imgs.length > 0 ? "image" : "video";
    while (i < imgs.length || v < vids.length) {
      if (turn === "image" && i < imgs.length) merged.push({ type: "image", url: imgs[i++] });
      else if (turn === "video" && v < vids.length) merged.push({ type: "video", url: vids[v++] });
      else {
        if (i < imgs.length) merged.push({ type: "image", url: imgs[i++] });
        else if (v < vids.length) merged.push({ type: "video", url: vids[v++] });
        else break;
      }
      turn = turn === "image" ? "video" : "image";
    }
    return merged;
  };

  useEffect(() => {
    if (!form) return;
    if (autoArrange) setMediaOrder(buildAutoMerged());
    else
      setMediaOrder([
        ...form.images.map((u) => ({ type: "image", url: u })),
        ...form.videos.map((u) => ({ type: "video", url: u })),
      ]);
    // eslint-disable-next-line
  }, [form?.images?.length, form?.videos?.length, autoArrange]);

  // drag
  const handleDragStart = (e, pos) => {
    dragItem.current = pos;
  };
  const handleDragEnter = (e, pos) => {
    dragOverItem.current = pos;
  };
  const handleDragEnd = () => {
    const list = [...mediaOrder];
    const dragged = list[dragItem.current];
    list.splice(dragItem.current, 1);
    list.splice(dragOverItem.current, 0, dragged);
    dragItem.current = null;
    dragOverItem.current = null;
    setMediaOrder(list);
  };

  const removeAt = (idx) => {
    const item = mediaOrder[idx];
    if (!item) return;
    if (item.type === "image") setField("images", form.images.filter((u) => u !== item.url));
    else setField("videos", form.videos.filter((u) => u !== item.url));
    if (autoArrange) setMediaOrder(buildAutoMerged());
    else setMediaOrder((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveItem = (idx, dir) => {
    const arr = [...mediaOrder];
    const target = dir === "left" ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setMediaOrder(arr);
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      if (!form.name?.trim()) throw new Error("Name required");
      if (!form.category) throw new Error("Category required");
      if (!form.price || Number(form.price) <= 0) throw new Error("Price invalid");
      if (!form.stock || Number(form.stock) <= 0) throw new Error("Stock invalid");

      const merged = autoArrange ? buildAutoMerged() : mediaOrder;
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.images[0] || merged.find((m) => m.type === "image")?.url || "",
        mediaOrder: merged,
      };

      await axios.put(`${API_BASE}/api/sellers/products/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product updated!");
      setTimeout(() => navigate("/seller/products"), 600);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Update failed.");
      if (err.response?.status === 401) logout();
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div className="p-12 text-center text-xl">Loading...</div>;

  return (
    <>
      <SellerNavbar />
      <ToastContainer position="top-center" />

      <motion.div
        className="min-h-screen bg-gradient-to-br from-[#f6f5ff] to-[#edeaff] py-10 sm:py-14 px-4 sm:px-6"
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-6xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="relative bg-white/60 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-20px_rgba(42,0,85,0.3)] border border-white/50 p-4 sm:p-8 md:p-10 space-y-6"
          >
            <motion.h2
              className="text-2xl sm:text-3xl md:text-4xl font-black text-[#2a0055] drop-shadow"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Edit Product
            </motion.h2>
            {err && <div className="mb-3 text-red-600">{err}</div>}

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Inputs */}
              <div className="lg:col-span-2 space-y-4">
                <input
                  className="w-full p-4 rounded-2xl border-2 bg-white/70 backdrop-blur shadow focus:ring-2 focus:ring-[#2a0055] text-base md:text-lg"
                  placeholder="Product name"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />

                <div className="grid sm:grid-cols-2 gap-4">
                  <select
                    className="w-full p-4 rounded-2xl border-2 bg-white/70 backdrop-blur shadow"
                    value={form.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    <option value="">-- Select Category --</option>
                    {CATEGORY_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-4">
                    <input
                      type="number"
                      min="1"
                      placeholder="Stock"
                      className="p-4 rounded-2xl border-2 bg-white/70 backdrop-blur shadow flex-1"
                      value={form.stock}
                      onChange={(e) => setField("stock", e.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Price"
                      className="p-4 rounded-2xl border-2 bg-white/70 backdrop-blur shadow flex-1"
                      value={form.price}
                      onChange={(e) => setField("price", e.target.value)}
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Description"
                  className="w-full p-4 rounded-2xl border-2 bg-white/70 backdrop-blur shadow"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />

                <input
                  placeholder="Delivery info"
                  className="w-full p-4 rounded-2xl border-2 bg-white/70 backdrop-blur shadow"
                  value={form.delivery}
                  onChange={(e) => setField("delivery", e.target.value)}
                />

                {/* Auto arrange toggle */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <span className="text-sm text-gray-600">Auto alternate images & videos</span>
                  <button
                    type="button"
                    onClick={() => setAutoArrange((v) => !v)}
                    className={`relative w-16 h-9 rounded-full transition border ${
                      autoArrange ? "bg-[#2a0055]" : "bg-white"
                    }`}
                    aria-pressed={autoArrange}
                  >
                    <span
                      className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
                        autoArrange ? "translate-x-7" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Media */}
              <div className="flex flex-col gap-6">
                {/* Images */}
                <motion.div layout className="p-4 rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#2a0055] text-lg">
                      <FaRegImage /> Images
                    </div>
                    <div className="inline-flex rounded-xl overflow-hidden border bg-white/70">
                      {[
                        { k: "upload", label: <FaCloudUploadAlt /> },
                        { k: "url", label: <FaLink /> },
                        { k: "album", label: <FaImages /> },
                      ].map((b) => (
                        <button
                          key={b.k}
                          type="button"
                          className={`px-3 py-2 text-sm font-semibold ${
                            imageMode === b.k ? "bg-[#2a0055] text-white" : ""
                          }`}
                          onClick={() => setImageMode(b.k)}
                          title={
                            b.k === "upload"
                              ? "Upload"
                              : b.k === "url"
                              ? "Add by URL"
                              : "Choose from Album"
                          }
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    {imageMode === "upload" && (
                      <label className="block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-black/5">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          multiple
                          onChange={(e) => handleFilesChange(e, "image")}
                        />
                        <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                          <FaCloudUploadAlt className="text-2xl" />
                          Drag & drop or click to upload images
                        </div>
                      </label>
                    )}
                    {imageMode === "url" && (
                      <div className="flex gap-2">
                        <input id="img-url" className="flex-1 p-3 rounded-xl border bg-white/70" placeholder="Paste image URL" />
                        <button
                          type="button"
                          className="px-4 py-2 bg-[#2a0055] text-white rounded-xl"
                          onClick={() => {
                            const el = document.getElementById("img-url");
                            if (el?.value) {
                              addUrl("image", el.value.trim());
                              el.value = "";
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                    {imageMode === "album" && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAlbumType("image");
                            setShowAlbum(true);
                          }}
                          className="px-4 py-2 bg-white/70 border rounded-xl hover:bg-white"
                        >
                          Open Image Album
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-gray-600 mt-2">
                      {form.images.length} selected
                      {uploading && (
                        <>
                          <FaSpinner className="inline animate-spin ml-2" /> {progress}%
                          <div className="h-1 bg-gray-200 rounded mt-1">
                            <div className="h-1 bg-[#2a0055] rounded" style={{ width: `${progress}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>

                {/* Videos */}
                <motion.div layout className="p-4 rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-[#2a0055] text-lg">
                      <FaRegPlayCircle /> Videos
                    </div>
                    <div className="inline-flex rounded-xl overflow-hidden border bg-white/70">
                      {[
                        { k: "upload", label: <FaCloudUploadAlt /> },
                        { k: "url", label: <FaLink /> },
                        { k: "album", label: <FaImages /> },
                      ].map((b) => (
                        <button
                          key={b.k}
                          type="button"
                          className={`px-3 py-2 text-sm font-semibold ${
                            videoMode === b.k ? "bg-[#2a0055] text-white" : ""
                          }`}
                          onClick={() => setVideoMode(b.k)}
                          title={
                            b.k === "upload"
                              ? "Upload"
                              : b.k === "url"
                              ? "Add by URL"
                              : "Choose from Album"
                          }
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    {videoMode === "upload" && (
                      <label className="block border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer hover:bg-black/5">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          multiple
                          onChange={(e) => handleFilesChange(e, "video")}
                        />
                        <div className="flex flex-col items-center gap-2 text-sm text-gray-600">
                          <FaCloudUploadAlt className="text-2xl" />
                          Drag & drop or click to upload videos
                        </div>
                      </label>
                    )}
                    {videoMode === "url" && (
                      <div className="flex gap-2">
                        <input id="vid-url" className="flex-1 p-3 rounded-xl border bg-white/70" placeholder="Paste video URL" />
                        <button
                          type="button"
                          className="px-4 py-2 bg-[#2a0055] text-white rounded-xl"
                          onClick={() => {
                            const el = document.getElementById("vid-url");
                            if (el?.value) {
                              addUrl("video", el.value.trim());
                              el.value = "";
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                    {videoMode === "album" && (
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAlbumType("video");
                            setShowAlbum(true);
                          }}
                          className="px-4 py-2 bg-white/70 border rounded-xl hover:bg-white"
                        >
                          Open Video Album
                        </button>
                      </div>
                    )}

                    <div className="text-xs text-gray-600 mt-2">
                      {form.videos.length} selected
                      {uploading && (
                        <>
                          <FaSpinner className="inline animate-spin ml-2" /> {progress}%
                          <div className="h-1 bg-gray-200 rounded mt-1">
                            <div className="h-1 bg-[#2a0055] rounded" style={{ width: `${progress}%` }} />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              <div className="mb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h3 className="font-semibold text-lg md:text-xl">Media Preview & Order</h3>
                <div className="text-xs text-gray-500">Drag to reorder (Manual mode)</div>
              </div>
              <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimatePresence>
                  {mediaOrder.length === 0 && (
                    <motion.div
                      className="text-sm text-gray-400 col-span-full text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      No media yet
                    </motion.div>
                  )}
                  {mediaOrder.map((m, idx) => (
                    <motion.div
                      key={m.url + idx}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.18 }}
                      draggable={!autoArrange}
                      onDragStart={(e) => !autoArrange && handleDragStart(e, idx)}
                      onDragEnter={(e) => !autoArrange && handleDragEnter(e, idx)}
                      onDragEnd={() => !autoArrange && handleDragEnd()}
                      className="relative border rounded-2xl overflow-hidden bg-white/80 backdrop-blur shadow-lg"
                    >
                      {m.type === "image" ? (
                        <motion.img
                          src={m.url}
                          alt="media"
                          whileHover={{ scale: 1.04 }}
                          className="w-full h-24 md:h-32 lg:h-40 object-cover cursor-pointer"
                          loading="lazy"
                        />
                      ) : (
                        <motion.video
                          src={m.url}
                          controls
                          whileHover={{ scale: 1.02 }}
                          className="w-full h-24 md:h-32 lg:h-40 object-cover bg-black cursor-pointer"
                        />
                      )}
                      <div className="p-2 flex items-center justify-between">
                        <div className="text-xs font-medium text-gray-700">{m.type.toUpperCase()}</div>
                        <div className="flex gap-2 items-center">
                          {!autoArrange && (
                            <>
                              <button type="button" onClick={() => moveItem(idx, "left")} className="text-xs px-2 py-1 border rounded">
                                <FaArrowLeft />
                              </button>
                              <button type="button" onClick={() => moveItem(idx, "right")} className="text-xs px-2 py-1 border rounded">
                                <FaArrowRight />
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => removeAt(idx)}
                            className="text-xs px-2 py-1 bg-red-50 text-red-600 border rounded"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>

            <div className="mt-8 flex flex-col md:flex-row gap-4">
              <motion.button
                disabled={saving || uploading}
                className="w-full md:w-auto px-7 py-4 bg-[#2a0055] text-white rounded-2xl font-extrabold text-lg shadow-md flex items-center justify-center gap-2 active:scale-[.98]"
                type="submit"
                whileTap={{ scale: 0.97 }}
              >
                {saving ? <FaSpinner className="animate-spin" /> : null}
                {saving ? "Saving..." : "Update Product"}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => navigate(-1)}
                className="px-7 py-4 bg-white/80 backdrop-blur border rounded-2xl font-bold text-lg shadow active:scale-[.98]"
                whileTap={{ scale: 0.94 }}
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {showAlbum && (
          <AlbumModal
            isOpen={showAlbum}
            initialTab={albumType}
            onClose={() => setShowAlbum(false)}
            onPick={addFromAlbum}
          />
        )}
      </AnimatePresence>
    </>
  );
}
