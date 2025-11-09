// Frontend/src/seller/pages/SellerEditProduct.jsx
import React, { useState, useRef, useEffect } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const CATEGORY_LIST = [
  "fashion", "electronic", "furniture", "kitchen", "toys", "cosmetic", "food", "sports", "appliances"
];

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function SellerEditProduct() {
  const { seller, token, logout } = useSellerAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [imageMode, setImageMode] = useState("upload");
  const [videoMode, setVideoMode] = useState("upload");
  const [autoArrange, setAutoArrange] = useState(true);
  const [mediaOrder, setMediaOrder] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const dragItem = useRef();
  const dragOverItem = useRef();

  // fetch product to edit
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/sellers/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setForm({
          ...data,
          images: data.images || [],
          videos: data.videos || [],
          delivery: data.delivery || ""
        });
        setMediaOrder(data.mediaOrder || [
          ...data.images.map(u => ({ type: "image", url: u })),
          ...data.videos.map(u => ({ type: "video", url: u }))
        ]);
      } catch {
        setErr("Product not found");
      }
    };
    load();
  }, [id, token]);

  const setField = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const uploadFile = async (file) => {
    if (!file) return null;
    const fd = new FormData();
    fd.append("file", file);
    try {
      setUploading(true);
      const res = await axios.post(`${API_BASE}/api/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 120000
      });
      return res.data.url || res.data.secure_url || null;
    } catch (e) {
      console.error("upload error", e);
      setErr("Upload failed. Try again.");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (!url) return;
    if (type === "image") setField("images", [...form.images, url]);
    else setField("videos", [...form.videos, url]);
  };

  const addUrl = (type, url) => {
    if (!url) return;
    if (type === "image") setField("images", [...form.images, url]);
    else setField("videos", [...form.videos, url]);
  };

  const buildAutoMerged = () => {
    const imgs = [...form.images];
    const vids = [...form.videos];
    const merged = [];
    let i = 0, v = 0;
    let turn = imgs.length > 0 ? "image" : "video";
    while (i < imgs.length || v < vids.length) {
      if (turn === "image" && i < imgs.length) merged.push({ type: "image", url: imgs[i++] });
      else if (turn === "video" && v < vids.length) merged.push({ type: "video", url: vids[v++] });
      else {
        if (i < imgs.length) merged.push({ type: "image", url: imgs[i++] });
        else if (v < vids.length) merged.push({ type: "video", url: vids[v++] });
        else break;
      }
      turn = (turn === "image") ? "video" : "image";
    }
    return merged;
  };

  useEffect(() => {
    if (!form) return;
    if (autoArrange) setMediaOrder(buildAutoMerged());
  }, [form?.images?.length, form?.videos?.length, autoArrange]);

  const handleDragStart = (e, pos) => { dragItem.current = pos; };
  const handleDragEnter = (e, pos) => { dragOverItem.current = pos; };
  const handleDragEnd = (e) => {
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
    if (item.type === "image") setField("images", form.images.filter(u => u !== item.url));
    else setField("videos", form.videos.filter(u => u !== item.url));
    setMediaOrder(prev => prev.filter((_, i) => i !== idx));
  };

  const moveItem = (idx, dir) => {
    const arr = [...mediaOrder];
    const target = dir === "left" ? idx - 1 : idx + 1;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    setMediaOrder(arr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSaving(true);
    try {
      if (!form.name.trim()) throw new Error("Name required");
      if (!form.category) throw new Error("Category required");
      if (!form.price || form.price <= 0) throw new Error("Price invalid");
      if (!form.stock || form.stock <= 0) throw new Error("Stock invalid");

      const merged = autoArrange ? buildAutoMerged() : mediaOrder;
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        image: form.images[0] || merged.find(m => m.type === "image")?.url || "",
        mediaOrder: merged
      };

      await axios.put(`${API_BASE}/api/sellers/products/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate("/seller/products");
    } catch (err) {
      console.error(err);
      setErr(err.response?.data?.error || err.message || "Update failed.");
      if (err.response?.status === 401) logout();
    } finally {
      setSaving(false);
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen bg-[#f6f5ff] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-[#2a0055] mb-4">Edit Product</h2>
            {err && <div className="mb-3 text-red-600">{err}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-3">
                <input className="w-full p-3 border rounded" placeholder="Product name" value={form.name} onChange={e => setField("name", e.target.value)} />
                <select className="w-full p-3 border rounded" value={form.category} onChange={e => setField("category", e.target.value)}>
                  <option value="">-- Select Category --</option>
                  {CATEGORY_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" min="1" placeholder="Stock" className="p-3 border rounded" value={form.stock} onChange={e => setField("stock", e.target.value)} />
                  <input type="number" min="1" placeholder="Price" className="p-3 border rounded" value={form.price} onChange={e => setField("price", e.target.value)} />
                </div>
                <textarea placeholder="Description" className="w-full p-3 border rounded" rows={4} value={form.description} onChange={e => setField("description", e.target.value)}></textarea>
                <input placeholder="Delivery info" className="w-full p-3 border rounded" value={form.delivery} onChange={e => setField("delivery", e.target.value)} />
              </div>

              {/* Upload / URL inputs */}
              <div className="p-4 border rounded bg-white space-y-4">
                <div>
                  <div className="font-semibold">Auto Arrange (Flipkart style)</div>
                  <div className="text-xs text-gray-500">Toggle to auto alternate image & video</div>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => setAutoArrange(true)} className={`px-3 py-1 rounded ${autoArrange ? "bg-[#2a0055] text-white" : "bg-white border"}`}>Auto</button>
                    <button type="button" onClick={() => setAutoArrange(false)} className={`px-3 py-1 rounded ${!autoArrange ? "bg-[#2a0055] text-white" : "bg-white border"}`}>Manual</button>
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <div className="font-semibold">Images</div>
                  <div className="mt-2 flex gap-2 items-center">
                    <label className={`px-2 py-1 border rounded ${imageMode==="upload"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={imageMode==="upload"} onChange={() => setImageMode("upload")} /> Upload</label>
                    <label className={`px-2 py-1 border rounded ${imageMode==="url"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={imageMode==="url"} onChange={() => setImageMode("url")} /> URL</label>
                  </div>
                  <div className="mt-2">
                    {imageMode === "upload" ? (
                      <input type="file" accept="image/*" onChange={(e)=>handleFileChange(e,"image")} />
                    ) : (
                      <div className="flex gap-2">
                        <input id="img-url" className="flex-1 p-2 border rounded" placeholder="Paste image URL" />
                        <button type="button" className="px-3 py-1 bg-[#2a0055] text-white rounded" onClick={()=>{
                          const el=document.getElementById("img-url");
                          if(el?.value){ addUrl("image", el.value.trim()); el.value=""; }
                        }}>Add</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload */}
                <div>
                  <div className="font-semibold">Videos</div>
                  <div className="mt-2 flex gap-2 items-center">
                    <label className={`px-2 py-1 border rounded ${videoMode==="upload"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={videoMode==="upload"} onChange={()=>setVideoMode("upload")} /> Upload</label>
                    <label className={`px-2 py-1 border rounded ${videoMode==="url"?"bg-[#2a0055] text-white":"bg-white"}`}><input type="radio" checked={videoMode==="url"} onChange={()=>setVideoMode("url")} /> URL</label>
                  </div>
                  <div className="mt-2">
                    {videoMode === "upload" ? (
                      <input type="file" accept="video/*" onChange={(e)=>handleFileChange(e,"video")} />
                    ) : (
                      <div className="flex gap-2">
                        <input id="vid-url" className="flex-1 p-2 border rounded" placeholder="Paste video URL" />
                        <button type="button" className="px-3 py-1 bg-[#2a0055] text-white rounded" onClick={()=>{
                          const el=document.getElementById("vid-url");
                          if(el?.value){ addUrl("video", el.value.trim()); el.value=""; }
                        }}>Add</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Media Preview */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">Media Preview & Order</h3>
                <div className="text-xs text-gray-500">Drag to reorder (manual mode)</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {mediaOrder.length === 0 && <div className="text-sm text-gray-400 col-span-full">No media</div>}
                {mediaOrder.map((m, idx) => (
                  <div key={m.url + idx}
                    draggable={!autoArrange}
                    onDragStart={(e)=>!autoArrange && handleDragStart(e, idx)}
                    onDragEnter={(e)=>!autoArrange && handleDragEnter(e, idx)}
                    onDragEnd={(e)=>!autoArrange && handleDragEnd(e)}
                    className="relative border rounded overflow-hidden bg-white"
                  >
                    {m.type==="image" ? (
                      <img src={m.url} alt="" className="w-full h-36 object-cover" />
                    ) : (
                      <video src={m.url} controls className="w-full h-36 object-cover bg-black" />
                    )}
                    <div className="p-2 flex justify-between items-center">
                      <span className="text-xs text-gray-600">{m.type}</span>
                      <div className="flex gap-2">
                        {!autoArrange && (
                          <>
                            <button type="button" onClick={()=>moveItem(idx,"left")} className="text-xs px-2 py-1 border rounded">◀</button>
                            <button type="button" onClick={()=>moveItem(idx,"right")} className="text-xs px-2 py-1 border rounded">▶</button>
                          </>
                        )}
                        <button type="button" onClick={()=>removeAt(idx)} className="text-xs px-2 py-1 bg-red-50 text-red-600 border rounded">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button disabled={saving || uploading} className="px-5 py-3 bg-[#2a0055] text-white rounded-lg" type="submit">
                {saving ? "Saving..." : "Update Product"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
