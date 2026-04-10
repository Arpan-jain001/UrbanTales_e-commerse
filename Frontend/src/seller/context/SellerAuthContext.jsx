import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const SellerAuthContext = createContext();

export function SellerAuthProvider({ children }) {
  const [seller, setSeller] = useState(() => {
    try {
      const raw = localStorage.getItem("sellerUser");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem("sellerToken") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setSeller(null);
      setLoading(false);
      return;
    }

    axios
      .get(`${API_BASE}/api/sellers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setSeller(data);
        localStorage.setItem("sellerUser", JSON.stringify(data));
      })
      .catch(() => {
        setSeller(null);
        setToken("");
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerUser");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (authToken, sellerData) => {
    localStorage.setItem("sellerToken", authToken);
    if (sellerData) {
      localStorage.setItem("sellerUser", JSON.stringify(sellerData));
      setSeller(sellerData);
    }
    setToken(authToken);
  };

  const updateProfile = async (fields) => {
    const { data } = await axios.put(`${API_BASE}/api/sellers/profile`, fields, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSeller(data);
    localStorage.setItem("sellerUser", JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setSeller(null);
    setToken("");
    localStorage.removeItem("sellerToken");
    localStorage.removeItem("sellerUser");
    setLoading(false);
  };

  return (
    <SellerAuthContext.Provider
      value={{ seller, token, updateProfile, logout, loading, setToken, login }}
    >
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  return useContext(SellerAuthContext);
}
