import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { sellerAuth, sellerProvider } from "../utils/firebase.seller";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function SellerLogin() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Email/Password input
  const handleChange = (e) => setFormData((p) => ({
    ...p, [e.target.name]: e.target.value
  }));

  // Manual login handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/sellers/auth/login`, formData);
      localStorage.setItem("sellerToken", data.token);
      alert("Sign in successful!");
      navigate("/seller/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Invalid credentials / Something went wrong"
      );
    }
  };

  // Google login handler (Firebase v9+) with Google icon
  const handleGoogleLogin = async () => {
    setError("");
    try {
      const result = await signInWithPopup(sellerAuth, sellerProvider);
      const user = result.user;
      const payload = {
        email: user.email,
        fullName: user.displayName,
        googleId: user.uid,
      };
      const { data } = await axios.post(`${BASE_API_URL}/api/sellers/auth/google-login`, payload);
      localStorage.setItem("sellerToken", data.token);
      alert("Google sign in successful!");
      navigate("/seller/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        "Google login failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg p-10 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-5 text-center text-[#440077]">Seller Login</h2>
        {error && <div className="text-red-600 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="mb-2">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            autoComplete="username"
            onChange={handleChange}
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            autoComplete="current-password"
            onChange={handleChange}
            className="w-full p-3 mb-3 border rounded"
            required
          />
          <button
            className="w-full py-2 rounded bg-[#070A52] text-white font-bold mb-3 hover:bg-[#FFCC00] hover:text-[#440077] transition"
            type="submit"
          >
            Sign In
          </button>
        </form>
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 mt-2 py-2 bg-white border border-gray-300 rounded font-bold hover:bg-gray-100 transition"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png"
            alt="Google"
            className="h-5 w-5"
          />
          <span>Sign in with Google</span>
        </button>
        <Link
          to="/seller/signup"
          className="block mt-5 text-blue-700 underline text-sm text-center"
        >
          Don't have an account? Sign Up
        </Link>
      </div>
    </div>
  );
}
