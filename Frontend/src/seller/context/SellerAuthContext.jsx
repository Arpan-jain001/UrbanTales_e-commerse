import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { clearAuthSession, getAuthToken, getAuthUser, saveAuthSession } from "../../utils/authSession";

const API_BASE = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const SellerAuthContext = createContext();

export function SellerAuthProvider({ children }) {
  const [seller, setSeller] = useState(() => getAuthUser("seller"));
  const [token, setToken] = useState(() => getAuthToken("seller"));
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
        saveAuthSession("seller", {
          token,
          user: data,
          remember: Boolean(localStorage.getItem("sellerToken")),
        });
      })
      .catch(() => {
        setSeller(null);
        setToken("");
        clearAuthSession("seller");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (authToken, sellerData, options = {}) => {
    if (sellerData) {
      saveAuthSession("seller", {
        token: authToken,
        user: sellerData,
        remember: options.remember !== false,
      });
      setSeller(sellerData);
    }
    setToken(authToken);
  };

  const updateProfile = async (fields) => {
    const { data } = await axios.put(`${API_BASE}/api/sellers/profile`, fields, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSeller(data);
    saveAuthSession("seller", {
      token,
      user: data,
      remember: Boolean(localStorage.getItem("sellerToken")),
    });
    return data;
  };

  const logout = () => {
    setSeller(null);
    setToken("");
    clearAuthSession("seller");
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
