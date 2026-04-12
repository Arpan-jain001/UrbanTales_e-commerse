import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { clearAuthSession, getAuthToken, getAuthUser, saveAuthSession } from "../../utils/authSession";

const AdminAuthContext = createContext(null);

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => getAuthUser("admin"));
  const [token, setToken] = useState(() => getAuthToken("admin") || null);
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
        saveAuthSession("admin", {
          token,
          user: res.data.admin,
          remember: true,
        });
      })
      .catch(() => {
        setAdmin(null);
        setToken(null);
        clearAuthSession("admin");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (data) => {
    setToken(data.token);
    setAdmin(data.admin);
    saveAuthSession("admin", {
      token: data.token,
      user: data.admin,
      remember: true,
    });
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    clearAuthSession("admin");
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
