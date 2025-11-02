import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const SellerAuthContext = createContext();

export function SellerAuthProvider({ children }) {
  const [seller, setSeller] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("sellerToken") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.get(`${API_BASE}/api/sellers/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(({ data }) => { setSeller(data); setLoading(false); })
        .catch(() => { setSeller(null); setLoading(false); });
    } else { setSeller(null); setLoading(false); }
  }, [token]);

  const updateProfile = async (fields) => {
    const { data } = await axios.put(`${API_BASE}/api/sellers/profile`, fields, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSeller(data);
    return data;
  };

  const logout = () => {
    setSeller(null);
    setToken("");
    localStorage.removeItem("sellerToken");
    setLoading(false);
  };

  return (
    <SellerAuthContext.Provider value={{ seller, token, updateProfile, logout, loading, setToken }}>
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() { return useContext(SellerAuthContext); }
