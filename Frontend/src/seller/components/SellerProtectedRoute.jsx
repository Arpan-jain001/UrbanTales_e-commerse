import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSellerAuth } from "../context/SellerAuthContext";

export default function SellerProtectedRoute() {
  const { token, seller, loading } = useSellerAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-[#070A52]">Loading seller account...</div>;
  }

  if (!token) {
    return <Navigate to="/sellerlogin" replace />;
  }

  if (seller && !seller.isVerified) {
    return <Navigate to={`/seller/verify-account?email=${encodeURIComponent(seller.email || "")}`} replace />;
  }

  return <Outlet />;
}
