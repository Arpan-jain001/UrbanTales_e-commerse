import React, { useState, useEffect } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function SellerProfile() {
  const { seller, updateProfile, logout } = useSellerAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", 
    email: "", 
    phone: "", 
    shopName: "", 
    address: "", 
    bio: "",
    username: ""
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch seller profile from backend
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("sellerToken");
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${BASE_API_URL}/api/sellers/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setForm({
        fullName: data.fullName || "",
        email: data.email || "",
        phone: data.phone || "",
        shopName: data.shopName || "",
        address: data.address || "",
        bio: data.bio || "",
        username: data.username || ""
      });
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const saveUpdate = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const token = localStorage.getItem("sellerToken");
      await axios.put(
        `${BASE_API_URL}/api/sellers/profile`,
        { shopName: form.shopName, address: form.address, bio: form.bio, phone: form.phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // Enhanced Logout Function
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // Clear all seller-related data
      localStorage.removeItem("sellerToken");
      sessionStorage.clear();
      
      // Optional: Call logout API if you have one
      // await axios.post(`${BASE_API_URL}/api/sellers/auth/logout`);
      
      // Wait a bit for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Redirect to login and replace history
      navigate("/sellerlogin", { replace: true });
      
      // Clear browser history to prevent back button
      window.history.pushState(null, "", window.location.href);
      window.onpopstate = function() {
        window.history.pushState(null, "", window.location.href);
      };
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (loading) {
    return (
      <>
        <SellerNavbar />
        <div className="min-h-screen flex items-center justify-center">
          <HashLoader color="#070A52" size={50} />
        </div>
      </>
    );
  }

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto px-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Header Section with Beautiful Gradients */}
            <div className="bg-gradient-to-r from-[#070A52] to-[#0d1170] p-8 text-white">
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-300 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {form.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-1">
                    <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 text-transparent bg-clip-text">Welcome</span>, <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 text-transparent bg-clip-text">{form.fullName}</span>
                  </h2>
                  <p className="text-blue-200 text-lg">@{form.username}</p>
                  <p className="text-sm text-blue-200 mt-1">{form.email}</p>
                </div>
              </div>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-8 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-center font-semibold"
              >
                ✅ {success}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center font-semibold"
              >
                ❌ {error}
              </motion.div>
            )}

            {/* Profile Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-[#070A52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Personal Information
                  </h3>

                  <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                    <label className="text-sm font-semibold text-gray-600">Full Name</label>
                    <p className="text-gray-800 font-medium mt-1">{form.fullName}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-800 font-medium mt-1">{form.email}</p>
                  </div>

                  {editing ? (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="text-sm font-semibold text-gray-600 block mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#070A52] transition"
                        placeholder="Enter phone number"
                      />
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                      <label className="text-sm font-semibold text-gray-600">Phone</label>
                      <p className="text-gray-800 font-medium mt-1">{form.phone || "Not provided"}</p>
                    </div>
                  )}
                </div>

                {/* Shop Information */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-[#070A52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Shop Information
                  </h3>

                  {editing ? (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Shop Name</label>
                        <input
                          name="shopName"
                          value={form.shopName}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#070A52] transition"
                          placeholder="Enter shop name"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Address</label>
                        <input
                          name="address"
                          value={form.address}
                          onChange={handleChange}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#070A52] transition"
                          placeholder="Enter shop address"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Bio</label>
                        <textarea
                          name="bio"
                          value={form.bio}
                          onChange={handleChange}
                          rows={4}
                          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#070A52] transition"
                          placeholder="Tell us about your shop..."
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                        <label className="text-sm font-semibold text-gray-600">Shop Name</label>
                        <p className="text-gray-800 font-medium mt-1">{form.shopName || "Not set"}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                        <label className="text-sm font-semibold text-gray-600">Address</label>
                        <p className="text-gray-800 font-medium mt-1">{form.address || "Not set"}</p>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition">
                        <label className="text-sm font-semibold text-gray-600">Bio</label>
                        <p className="text-gray-800 mt-1">{form.bio || "No bio added yet"}</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                {editing ? (
                  <>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={saveUpdate}
                      disabled={saving}
                      className="flex-1 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
                    >
                      {saving ? <HashLoader color="#fff" size={20} /> : "💾 Save Changes"}
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setEditing(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
                    >
                      ❌ Cancel
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setEditing(true)}
                    className="flex-1 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    ✏️ Edit Profile
                  </motion.button>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setShowLogoutModal(true)}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition"
                >
                  🚪 Logout
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !loggingOut && setShowLogoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Confirm Logout</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to logout from your seller account?
                </p>
                <div className="flex gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLogoutModal(false)}
                    disabled={loggingOut}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {loggingOut ? (
                      <HashLoader color="#fff" size={20} />
                    ) : (
                      "Yes, Logout"
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
