import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { BarChart2, Boxes, Box, ShoppingCart, User, DollarSign } from "lucide-react";
import { useSellerAuth } from "../context/SellerAuthContext";
import axios from "axios";

const sidebarItems = [
  { label: "Dashboard", href: "/seller/dashboard", icon: <BarChart2 /> },
  { label: "Products", href: "/seller/products", icon: <Boxes /> },
  { label: "Add Product", href: "/seller/add-product", icon: <Box /> },
  { label: "Orders", href: "/seller/orders", icon: <ShoppingCart /> },
  { label: "Earnings", href: "/seller/earnings", icon: <DollarSign /> },
  { label: "Profile", href: "/seller/profile", icon: <User /> },
];

export default function SellerSidebar() {
  const { token, logout } = useSellerAuth();
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/sellers/me`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSeller(data);
      } catch {
        logout();
      }
    }
    fetchProfile();
  }, [token, logout]);

  return (
    <aside className="bg-[#440077] text-yellow-300 w-60 min-h-screen px-4 pt-8 shadow-xl flex flex-col space-y-6 sticky top-0">
      <div className="mb-6 text-center">
        {seller?.avatar ? (
          <img src={seller.avatar} alt="Seller" className="w-16 h-16 mx-auto rounded-full border-4 border-yellow-300" />
        ) : (
          <User className="w-16 h-16 mx-auto text-yellow-200" />
        )}
        <div className="font-bold text-lg mt-2">{seller?.fullName || seller?.email || "Seller"}</div>
        <div className="text-xs text-yellow-200">{seller?.shopName}</div>
      </div>
      {sidebarItems.map(item => (
        <NavLink
          key={item.label}
          to={item.href}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded font-semibold hover:bg-yellow-200 hover:text-[#440077] transition ${isActive ? "bg-yellow-300 text-[#440077]" : ""}`
          }
        >
          <span>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </aside>
  );
}
