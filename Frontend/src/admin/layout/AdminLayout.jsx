import React, { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import { 
  Bell, 
  Menu, 
  X, 
  LayoutDashboard, 
  Package, 
  Users, 
  Store, 
  ShoppingCart, 
  UserCircle, 
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Video
} from "lucide-react";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/admin/products", label: "Products", icon: Package },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/sellers", label: "Sellers", icon: Store },
  { path: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { path: "/admin/promotions", label: "Promotions", icon: Video },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
  { path: "/admin/profile", label: "Profile", icon: UserCircle },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { admin, logout, isSuperAdmin, token } = useAdminAuth();
  const [notifCount, setNotifCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/admin/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifCount(data.count || 0);
        }
      } catch {}
    };

    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,#22c55e12_0,transparent_55%),radial-gradient(circle_at_100%_100%,#6366f112_0,transparent_55%)]" />
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden lg:flex bg-slate-950/90 border-r border-slate-800/80 flex-col backdrop-blur-xl shadow-[4px_0_40px_rgba(15,23,42,0.7)]"
      >
        {/* Logo + Collapse */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <span className="text-[11px] font-semibold text-slate-950">
                UT
              </span>
            </div>
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-[11px] text-slate-400">UrbanTales</p>
                <p className="text-sm font-semibold">Admin Panel</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed((p) => !p)}
            className="text-slate-400 hover:text-amber-300 border border-slate-700 rounded-full w-7 h-7 flex items-center justify-center bg-slate-900/50 transition"
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  [
                    "group relative flex items-center gap-3 px-4 py-2.5 text-sm transition",
                    isActive
                      ? "text-amber-300"
                      : "text-slate-300 hover:text-slate-100",
                  ].join(" ")
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`absolute left-0 w-0.5 h-7 rounded-full bg-amber-400/90 transition ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      }`}
                    />
                    <Icon className="w-4 h-4" />
                    {!collapsed && (
                      <span
                        className={`flex-1 ${
                          isActive
                            ? "font-semibold"
                            : "font-normal group-hover:text-slate-50"
                        }`}
                      >
                        {item.label}
                      </span>
                    )}
                    {item.path === "/admin/notifications" && notifCount > 0 && !collapsed && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold min-w-[18px] text-center">
                        {notifCount > 99 ? "99+" : notifCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {isSuperAdmin && (
            <NavLink
              to="/admin/manage-admins"
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 px-4 py-2.5 text-sm transition mt-2",
                  isActive
                    ? "text-pink-300"
                    : "text-slate-300 hover:text-slate-100",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 w-0.5 h-7 rounded-full bg-pink-400/90 transition ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                  <Shield className="w-4 h-4" />
                  {!collapsed && <span>Manage Admins</span>}
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* Profile */}
        <div className="border-t border-slate-800/80 px-4 py-3">
          {!collapsed && (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-slate-200 text-sm">
                    {admin?.fullName || admin?.username}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    {admin?.role}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-[11px] text-slate-950 font-bold shadow">
                  {(admin?.fullName || admin?.username || "A")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-amber-300 bg-slate-900/60 hover:bg-slate-800 px-3 py-2 rounded-lg transition border border-slate-700/60"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </>
          )}
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-72 bg-slate-950 border-r border-slate-800 z-50 flex flex-col shadow-2xl lg:hidden"
            >
              {/* Header */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg">
                    <span className="text-[11px] font-semibold text-slate-950">
                      UT
                    </span>
                  </div>
                  <div className="leading-tight">
                    <p className="text-[11px] text-slate-400">UrbanTales</p>
                    <p className="text-sm font-semibold">Admin Panel</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Nav */}
              <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        [
                          "group relative flex items-center gap-3 px-4 py-2.5 text-sm transition",
                          isActive
                            ? "text-amber-300"
                            : "text-slate-300 hover:text-slate-100",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`absolute left-0 w-0.5 h-7 rounded-full bg-amber-400/90 transition ${
                              isActive ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          <Icon className="w-4 h-4" />
                          <span className={isActive ? "font-semibold" : "font-normal"}>
                            {item.label}
                          </span>
                          {item.path === "/admin/notifications" && notifCount > 0 && (
                            <span className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                              {notifCount > 99 ? "99+" : notifCount}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}

                {isSuperAdmin && (
                  <NavLink
                    to="/admin/manage-admins"
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      [
                        "group relative flex items-center gap-3 px-4 py-2.5 text-sm transition mt-2",
                        isActive
                          ? "text-pink-300"
                          : "text-slate-300 hover:text-slate-100",
                      ].join(" ")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`absolute left-0 w-0.5 h-7 rounded-full bg-pink-400/90 transition ${
                            isActive ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        <Shield className="w-4 h-4" />
                        <span>Manage Admins</span>
                      </>
                    )}
                  </NavLink>
                )}
              </nav>

              {/* Profile */}
              <div className="border-t border-slate-800 px-4 py-3">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium text-slate-200 text-sm">
                      {admin?.fullName || admin?.username}
                    </div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">
                      {admin?.role}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-pink-500 flex items-center justify-center text-[11px] text-slate-950 font-bold shadow">
                    {(admin?.fullName || admin?.username || "A")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-xs text-slate-300 hover:text-amber-300 bg-slate-900/60 hover:bg-slate-800 px-3 py-2 rounded-lg transition border border-slate-700/60"
                >
                                    <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-slate-800/80 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur-xl">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5 text-slate-300" />
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="hidden sm:inline">Welcome back,</span>
            <span className="font-semibold text-amber-300">
              {admin?.fullName || admin?.username}
            </span>
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          {/* Notification bell (header) */}
          <button
            onClick={() => navigate("/admin/notifications")}
            className="relative w-9 h-9 rounded-xl bg-slate-900/60 border border-slate-700 flex items-center justify-center hover:bg-slate-800 transition"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 bg-slate-950/90 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

