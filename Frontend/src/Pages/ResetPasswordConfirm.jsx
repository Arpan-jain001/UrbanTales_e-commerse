import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HashLoader } from "react-spinners";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const logoUrl =
  "https://drive.google.com/uc?export=view&id=1XxU_zf3_ZBDjuEWqGorEYUgBTzjoyaW_";

export default function ResetPasswordConfirm() {
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email");
  const otp = params.get("otp");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== cpassword) return setMsg("⚠️ Passwords do not match");
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/auth/reset-password/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword: password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Password reset successfully! Redirecting...");
        setTimeout(() => navigate("/login"), 1500);
      } else setMsg(data.msg || "❌ Reset failed.");
    } catch {
      setMsg("⚠️ Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="space-y-5 bg-white shadow-lg p-7 rounded-2xl w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <img src={logoUrl} className="mx-auto w-36 mb-3" alt="UrbanTales" />
        <h2 className="font-bold text-lg mb-3 text-[#070A52] text-center">
          Set New Password
        </h2>
        <input
          type="password"
          className="w-full border py-3 rounded px-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          minLength={6}
          required
        />
        <input
          type="password"
          className="w-full border py-3 rounded px-3"
          value={cpassword}
          onChange={(e) => setCPassword(e.target.value)}
          placeholder="Confirm password"
          minLength={6}
          required
        />
        <button
          className="w-full py-3 bg-[#070A52] text-white rounded-xl hover:bg-[#FFCC00] mt-2 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? <HashLoader color="#fff" size={20} /> : "Update Password"}
        </button>
        {msg && <div className="text-center mt-2 text-blue-600">{msg}</div>}
      </form>
    </div>
  );
}
