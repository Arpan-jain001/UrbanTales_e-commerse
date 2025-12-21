import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AdminAuthContext = createContext(null);

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("adminToken") || null
  );
  const [loading, setLoading] = useState(!!token);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios
      .get(`${BASE_API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAdmin(res.data.admin);
      })
      .catch(() => {
        setAdmin(null);
        setToken(null);
        localStorage.removeItem("adminToken");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (data) => {
    setToken(data.token);
    localStorage.setItem("adminToken", data.token);
    setAdmin(data.admin);
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("adminToken");
  };

  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isSuperAdmin: admin?.role === "SUPER_ADMIN",
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
