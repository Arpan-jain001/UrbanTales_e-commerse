import React from "react";
import { Navigate, Outlet } from 'react-router-dom';
import { useSellerAuth } from "../context/SellerAuthContext";

export default function SellerProtectedRoute() {
  const { token } = useSellerAuth();
  // Not logged in? Always redirect to login!
  if (!token) return <Navigate to="/sellerlogin" replace />;
  return <Outlet />;
}
