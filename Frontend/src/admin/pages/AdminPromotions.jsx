import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  FiVideo,
  FiX,
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiPlus,
  FiActivity,
  FiMonitor,
  FiImage,
} from "react-icons/fi";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const typeIcons = {
  VIDEO: FiVideo,
  BANNER: FiImage,
  ANIMATION: FiActivity,
  "3D": FiMonitor,
};

export default function AdminPromotions() {
  const { token } = useAdminAuth();
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "ANIMATION",
    mediaUrl: "",
    duration: 8,
    placement: "HOMEPAGE_FULLSCREEN",
    isActive: true,
    priority: 0,
    clickAction: "",
    targetAudience: "ALL",
    theme: "NEWYEAR",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (!token) return;
    fetchPromotions();
    // eslint-disable-next-line
  }, [token]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_API_URL}/api/promotions/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPromotions(res.data.promotions || []);
    } catch (error) {
      console.error('Fetch promotions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPromo) {
        await axios.put(
          `${BASE_API_URL}/api/promotions/admin/${editingPromo._id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${BASE_API_URL}/api/promotions/admin/create`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      fetchPromotions();
      closeModal();
    } catch (error) {
      console.error('Save promotion error:', error);
      alert(error.response?.data?.message || 'Failed to save promotion');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this promotion permanently?')) return;
    
    try {
      await axios.delete(`${BASE_API_URL}/api/promotions/admin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPromotions();
    } catch (error) {
      console.error('Delete promotion error:', error);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await axios.patch(
        `${BASE_API_URL}/api/promotions/admin/${id}/toggle`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPromotions();
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setForm({
      title: promo.title || "",
      description: promo.description || "",
      type: promo.type || "ANIMATION",
      mediaUrl: promo.mediaUrl || "",
      duration: promo.duration || 8,
      placement: promo.placement || "HOMEPAGE_FULLSCREEN",
      isActive: promo.isActive ?? true,
      priority: promo.priority || 0,
      clickAction: promo.clickAction || "",
            targetAudience: promo.targetAudience || "ALL",
      theme: promo.theme || "GENERIC",
      startDate: promo.startDate ? new Date(promo.startDate).toISOString().slice(0, 16) : "",
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().slice(0, 16) : "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPromo(null);
    setForm({
      title: "",
      description: "",
      type: "ANIMATION",
      mediaUrl: "",
      duration: 8,
      placement: "HOMEPAGE_FULLSCREEN",
      isActive: true,
      priority: 0,
      clickAction: "",
      targetAudience: "ALL",
      theme: "NEWYEAR",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <FiVideo className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-100">Promotions & Banners</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage promotional content</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
        >
          <FiPlus size={18} />
          Create Promotion
        </button>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-full flex justify-center py-16">
              <div className="w-10 h-10 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
            </div>
          ) : promotions.length === 0 ? (
            <div className="col-span-full bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center backdrop-blur-xl">
              <FiVideo size={48} className="text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No promotions yet</p>
              <p className="text-xs text-slate-500 mt-1">Create your first promotion</p>
            </div>
          ) : (
            promotions.map((promo, idx) => {
              const Icon = typeIcons[promo.type] || FiImage;
              const isExpired = promo.endDate && new Date(promo.endDate) < new Date();
              
              return (
                <motion.div
                  key={promo._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-xl shadow-lg hover:shadow-2xl hover:border-slate-700 transition-all"
                >
                  {/* Preview/Thumbnail */}
                  <div className="relative h-40 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center overflow-hidden">
                    <Icon className="w-16 h-16 text-slate-600" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold border backdrop-blur-md ${
                          isExpired
                            ? "bg-slate-500/20 text-slate-400 border-slate-500/50"
                            : promo.isActive
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                            : "bg-amber-500/20 text-amber-300 border-amber-500/50"
                        }`}
                      >
                        {isExpired ? "Expired" : promo.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/50 backdrop-blur-md">
                        <Icon size={14} />
                        {promo.type}
                      </div>
                    </div>

                    {/* Theme Badge */}
                    {promo.theme && promo.theme !== "GENERIC" && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/50 backdrop-blur-md">
                          {promo.theme}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-slate-100 mb-1 line-clamp-1">
                      {promo.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {promo.description || "No description"}
                    </p>

                    {/* Details */}
                    <div className="space-y-1.5 mb-3 text-xs text-slate-500">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-slate-300 font-semibold">{promo.duration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority:</span>
                        <span className="text-slate-300 font-semibold">{promo.priority}</span>
                      </div>
                      {promo.startDate && (
                        <div className="flex justify-between">
                          <span>Start:</span>
                          <span className="text-slate-300">{new Date(promo.startDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                      {promo.endDate && (
                        <div className="flex justify-between">
                          <span>End:</span>
                          <span className={isExpired ? "text-rose-400" : "text-slate-300"}>
                            {new Date(promo.endDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-slate-500 pb-3 border-b border-slate-800">
                      <div className="flex items-center gap-1">
                        <FiEye size={12} />
                        <span className="text-slate-400">{promo.viewCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiActivity size={12} />
                        <span className="text-slate-400">{promo.clickCount || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => toggleStatus(promo._id)}
                        disabled={isExpired}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          promo.isActive
                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                            : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                        } ${isExpired ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {promo.isActive ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                        {promo.isActive ? "Hide" : "Show"}
                      </button>
                      
                      <button
                        onClick={() => openEditModal(promo)}
                        className="flex items-center justify-center p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(promo._id)}
                        className="flex items-center justify-center p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-100">
                  {editingPromo ? "Edit Promotion" : "Create Promotion"}
                </h3>
                <button onClick={closeModal} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition">
                  <FiX className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g., 🎊 Happy New Year 2026!"
                    required
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Brief description..."
                    rows={3}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
                  />
                </div>

                {/* Type, Duration, Priority */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Type *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    >
                      <option value="ANIMATION">Animation</option>
                      <option value="VIDEO">Video</option>
                      <option value="BANNER">Banner</option>
                      <option value="3D">3D Model</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Duration (s) *</label>
                    <input
                      type="number"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      min="1"
                      max="60"
                      required
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Priority</label>
                    <input
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                                            min="0"
                      max="100"
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                  </div>
                </div>

                {/* Placement, Theme */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Placement *</label>
                    <select
                      value={form.placement}
                      onChange={(e) => setForm({ ...form, placement: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    >
                      <option value="HOMEPAGE_FULLSCREEN">Homepage Fullscreen</option>
                      <option value="NAVBAR">Navbar Banner</option>
                      <option value="SIDEBAR">Sidebar</option>
                      <option value="MODAL">Modal Popup</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Theme</label>
                    <select
                      value={form.theme}
                      onChange={(e) => setForm({ ...form, theme: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    >
                      <option value="NEWYEAR">New Year</option>
                      <option value="DIWALI">Diwali</option>
                      <option value="CHRISTMAS">Christmas</option>
                      <option value="SALE">Sale</option>
                      <option value="GENERIC">Generic</option>
                    </select>
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Target Audience</label>
                  <select
                    value={form.targetAudience}
                    onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  >
                    <option value="ALL">All Users</option>
                    <option value="NEW_USERS">New Users Only</option>
                    <option value="RETURNING_USERS">Returning Users</option>
                  </select>
                </div>

                {/* Click Action URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Click Action (Redirect URL)
                  </label>
                  <input
                    type="text"
                    value={form.clickAction}
                    onChange={(e) => setForm({ ...form, clickAction: e.target.value })}
                    placeholder="/category?cat=newyear or https://..."
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                  />
                </div>

                {/* Schedule - Start & End Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Start Date</label>
                    <input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">End Date</label>
                    <input
                      type="datetime-local"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                    />
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-pink-600 focus:ring-pink-500/50"
                  />
                  <label htmlFor="isActive" className="text-sm text-slate-300 font-medium cursor-pointer">
                    Set as Active immediately
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 text-slate-200 font-semibold border border-slate-700 hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingPromo ? "Update Promotion" : "Create Promotion"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


