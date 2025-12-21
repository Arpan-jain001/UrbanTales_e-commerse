import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion"; 
import { useAdminAuth } from "../context/AdminAuthContext";

const navItems = [
  { path: "/admin/dashboard", label: "Dashboard" },
  { path: "/admin/products", label: "Products" },
  { path: "/admin/users", label: "Users" },
  { path: "/admin/sellers", label: "Sellers" },
  { path: "/admin/orders", label: "Orders" },
  { path: "/admin/profile", label: "Profile" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { admin, logout, isSuperAdmin } = useAdminAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden">
      {/* soft gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,#22c55e12_0,transparent_55%),radial-gradient(circle_at_100%_100%,#6366f112_0,transparent_55%)]" />
      </div>

      {/* sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="bg-slate-950/90 border-r border-slate-800/80 flex flex-col backdrop-blur-xl shadow-[4px_0_40px_rgba(15,23,42,0.7)]"
      >
        {/* logo + collapse */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-2xl bg-linear-to-br from-amber-400 via-pink-500 to-indigo-500 flex items-center justify-center shadow-lg">
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
            className="text-slate-400 hover:text-amber-300 text-xs border border-slate-700 rounded-full w-7 h-7 flex items-center justify-center bg-slate-900/50"
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>

        {/* nav items */}
        <nav className="flex-1 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 px-4 py-2 text-sm transition",
                  isActive
                    ? "text-amber-300"
                    : "text-slate-300 hover:text-slate-100",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  {/* left active bar */}
                  <span
                    className={`absolute left-0 w-0.5 h-6 rounded-full bg-amber-400/90 transition ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 group-hover:bg-amber-300/90" />
                  {!collapsed && (
                    <span
                      className={`${
                        isActive
                          ? "font-semibold"
                          : "font-normal text-slate-300 group-hover:text-slate-50"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}

          {isSuperAdmin && (
            <NavLink
              to="/admin/manage-admins"
              className={({ isActive }) =>
                [
                  "group relative flex items-center gap-3 px-4 py-2 text-sm transition mt-2",
                  isActive
                    ? "text-pink-300"
                    : "text-slate-300 hover:text-slate-100",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`absolute left-0 w-0.5 h-6 rounded-full bg-pink-400/90 transition ${
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                    }`}
                  />
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-400/80 group-hover:bg-pink-300/90" />
                  {!collapsed && <span>Manage Admins</span>}
                </>
              )}
            </NavLink>
          )}
        </nav>

        {/* bottom profile */}
        <div className="border-t border-slate-800/80 px-4 py-3 text-xs text-slate-400">
          {!collapsed && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-200">
                    {admin?.fullName || admin?.username}
                  </div>
                  <div className="text-[11px] uppercase tracking-wide text-slate-500">
                    {admin?.role}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[11px] text-slate-100">
                  {(admin?.fullName || admin?.username || "A")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              </div>
              <button
                onClick={logout}
                className="mt-3 inline-flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200"
              >
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </motion.aside>

      {/* main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-slate-800/80 flex items-center justify-between px-4 md:px-6 bg-slate-950/80 backdrop-blur-xl">
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
          <div className="flex flex-col items-end text-[11px] text-slate-500">
            <span>UrbanTales Admin Control</span>
            <span className="text-slate-400">{admin?.email}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-slate-950/90">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
