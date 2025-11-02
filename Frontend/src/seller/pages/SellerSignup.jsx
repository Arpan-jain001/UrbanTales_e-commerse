  import React, { useState, useEffect } from "react";
  import axios from "axios";
  import { useNavigate } from "react-router-dom";
  import { motion } from "framer-motion";

  // Helper to generate clean username
  function makeUsername(fullName) {
    if (!fullName) return "";
    const base = fullName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    return base ? `${base}-${rand}` : "";
  }

  const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

  export default function SellerSignup() {
    const [formData, setFormData] = useState({
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Live username generate on fullName change
    useEffect(() => {
      setUsername(makeUsername(formData.fullName));
    }, [formData.fullName]);

    const handleChange = (e) => setFormData(f => ({
      ...f, [e.target.name]: e.target.value
    }));

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError("");
      setSuccess("");
      setLoading(true);
      const { fullName, email, phone, password, confirmPassword } = formData;
      if (!fullName || !email || !phone || !password || !confirmPassword) {
        setError("All fields are required");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setLoading(false);
        return;
      }
      try {
        // Always send backend-generated username too!
        const { data } = await axios.post(`${BASE_API_URL}/api/sellers/auth/signup`, {
          fullName, username, email, phone, password
        });
        setSuccess(`Signup successful! Your username is: "${data.seller.username}" (cannot be changed)`);
        setTimeout(() => {
          navigate("/sellerlogin");
        }, 2800);
      } catch (err) {
        setError(
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Signup failed."
        );
      }
      setLoading(false);
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-[#f8f6fc] via-[#f1ecfe] to-[#cfc9fe]">
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring" }}
          className="w-full max-w-3xl flex flex-col md:flex-row bg-white shadow-2xl rounded-3xl overflow-hidden"
        >
          {/* Left - Form */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full md:w-1/2 p-10 flex flex-col justify-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-[#440077]">Create Seller Account</h2>
            <a
              href="/sellerlogin"
              className="text-sm text-blue-700 underline mb-6 inline-block"
            >
              Already have an account? Sign In
            </a>
            {error && (
              <motion.p
                layout
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm mb-4">{error}</motion.p>
            )}
            {success && (
              <motion.p
                layout
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="text-green-600 text-sm mb-4 shadow-sm border border-green-400 rounded p-2 font-semibold bg-green-100"
              >{success}</motion.p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded transition focus:border-[#440077]"
                required
                autoComplete="off"
              />
              <div>
                <label className="text-xs text-[#440077] ml-1 font-bold">Username (auto-generated)</label>
                <input
                  type="text"
                  name="username"
                  value={username}
                  readOnly
                  disabled
                  className="w-full p-3 border border-[#dadada] rounded bg-gray-100 text-gray-500 font-mono mt-1 cursor-not-allowed"
                  tabIndex={-1}
                />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded transition focus:border-[#440077]"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded transition focus:border-[#440077]"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded transition focus:border-[#440077]"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded transition focus:border-[#440077]"
                required
              />
              <motion.button
                whileTap={{ scale: 0.98 }} whileHover={{ scale: 1.03 }}
                type="submit" disabled={loading}
                className="w-full bg-[#440077] text-white py-2 rounded font-bold hover:bg-[#FFCC00] hover:text-[#440077] shadow transition"
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </motion.button>
            </form>
          </motion.div>
          {/* Right - Animated Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full md:w-1/2 flex items-center justify-center bg-blue-50"
          >
            <img
              src="https://i.pinimg.com/736x/9d/f8/98/9df89840e668b11f0165040513d968b1.jpg"
              alt="Signup Illustration"
              className="w-72 h-72 rounded-2xl object-cover shadow-lg border-2 border-[#440077]"
            />
          </motion.div>
        </motion.div>
      </div>
    );
  }
