import React, { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";
import { getStoredUserToken } from "../utils/authStorage";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const statusColor = {
  Delivered: "bg-yellow-400 text-black",
  Shipped: "bg-blue-500 text-white",
  Placed: "bg-green-500 text-white",
  Pending: "bg-orange-500 text-white",
  "Out for Delivery": "bg-indigo-500 text-white",
  Cancelled: "bg-red-500 text-white",
  Returned: "bg-slate-700 text-white",
};

function StatCard({ label, value, helper }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-md">
      <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
        {label}
      </p>
      <p className="mt-4 text-4xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{helper}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getStoredUserToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        const [userRes, ordersRes, wishlistRes, alertsRes, walletRes] =
          await Promise.all([
            fetch(`${BASE_API_URL}/api/users/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${BASE_API_URL}/api/orders`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${BASE_API_URL}/api/wishlist`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${BASE_API_URL}/api/stock-alerts`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${BASE_API_URL}/api/gift-cards/wallet`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        if (!userRes.ok || !ordersRes.ok || !wishlistRes.ok || !alertsRes.ok) {
          throw new Error("Failed to load dashboard data");
        }

        const userData = await userRes.json();
        const orderData = await ordersRes.json();
        const wishlistData = await wishlistRes.json();
        const alertsData = await alertsRes.json();
        const walletData = walletRes.ok
          ? await walletRes.json()
          : { wallet: null };

        setUser(userData.user || userData);
        setOrders(Array.isArray(orderData.orders) ? orderData.orders : []);
        setWishlist(
          Array.isArray(wishlistData.wishlist) ? wishlistData.wishlist : []
        );
        setAlerts(Array.isArray(alertsData.alerts) ? alertsData.alerts : []);
        setWallet(walletData.wallet || null);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Unable to load dashboard data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "Delivered"
  ).length;
  const activeReturns = orders.filter((order) => order.returnStatus).length;

  const salesData = useMemo(() => {
    const grouped = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt || order.updatedAt || Date.now());
      const label = `${date.toLocaleString("en-IN", {
        month: "short",
      })} ${date.getFullYear()}`;
      grouped[label] = (grouped[label] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([name, sales]) => ({ name, sales }))
      .slice(-6);
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);
  const wishlistPreview = useMemo(() => wishlist.slice(0, 4), [wishlist]);
  const alertPreview = useMemo(() => alerts.slice(0, 4), [alerts]);

  const handleRemoveAlert = async (productId) => {
    const token = getStoredUserToken();
    try {
      const res = await fetch(`${BASE_API_URL}/api/stock-alerts/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to remove stock alert");
      }
      setAlerts((prev) =>
        prev.filter(
          (alert) =>
            String(alert.productId?._id || alert.productId) !==
            String(productId)
        )
      );
    } catch (err) {
      alert(err.message || "Unable to remove stock alert.");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-100 p-10">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="h-36 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div
                  key={idx}
                  className="h-36 rounded-3xl bg-slate-200 animate-pulse"
                />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
              <div className="h-80 rounded-2xl bg-slate-200 animate-pulse" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-6 md:p-10 font-sans space-y-8">
        <header className="bg-[#070A52] text-white rounded-2xl p-6 shadow-md">
          <h1 className="text-3xl font-bold">
            Hi, {user?.fullName || user?.name || "User"}
          </h1>
          <p className="text-lg mt-2">
            Your live dashboard is connected to orders, wishlist, stock alerts,
            and gift card balance.
          </p>
          {error ? (
            <p className="mt-3 rounded-xl bg-white/10 px-4 py-2 text-sm text-amber-200">
              {error}
            </p>
          ) : null}
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            label="Total Orders"
            value={orders.length}
            helper="All orders placed from your account"
          />
          <StatCard
            label="Delivered"
            value={deliveredOrders}
            helper="Successfully delivered orders"
          />
          <StatCard
            label="Wishlist"
            value={wishlist.length}
            helper="Saved products ready for later"
          />
          <StatCard
            label="Gift Wallet"
            value={formatCurrency(wallet?.balance || 0)}
            helper={`${alerts.length} active stock alert${
              alerts.length === 1 ? "" : "s"
            }`}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Order Activity</h2>
              <Link to="/trackorder" className="text-blue-600 font-medium text-sm">
                Track Orders
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#070A52"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Account Snapshot</h2>
              <Link to="/profile" className="text-blue-600 font-medium text-sm">
                Manage Profile
              </Link>
            </div>
            <div className="space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">
                  {user?.fullName || user?.name || "UrbanTales User"}
                </p>
                <p className="mt-1">{user?.email || "No email available"}</p>
                <p className="mt-1">{user?.phone || "Phone not added yet"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Returns
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">
                    {activeReturns}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Soonest Wallet Expiry
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {wallet?.soonestExpiry
                      ? new Date(wallet.soonestExpiry).toLocaleDateString(
                          "en-IN"
                        )
                      : "No active gift balance"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  to="/wishlist"
                  className="rounded-full bg-[#070A52] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0d1170]"
                >
                  Open Wishlist
                </Link>
                <Link
                  to="/notifications"
                  className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#070A52] shadow-md ring-1 ring-slate-200 transition hover:bg-slate-50"
                >
                  View Notifications
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Orders</h2>
            <Link to="/trackorder" className="text-blue-600 font-medium text-sm">
              See All
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-slate-500">
              No orders yet. Start shopping to see your activity here.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="py-2 px-4">Order ID</th>
                    <th className="py-2 px-4">Product</th>
                    <th className="py-2 px-4">Order Date</th>
                    <th className="py-2 px-4">Amount</th>
                    <th className="py-2 px-4">Status</th>
                    <th className="py-2 px-4">Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-2 px-4 font-medium text-slate-900">
                        {order.orderId || order._id}
                      </td>
                      <td className="py-2 px-4 text-slate-700">
                        {order.items?.[0]?.name || "Product"}
                      </td>
                      <td className="py-2 px-4 text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-2 px-4 text-slate-700">
                        {formatCurrency(order.totalAmount || 0)}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColor[order.orderStatus] ||
                            "bg-slate-200 text-slate-800"
                          }`}
                        >
                          {order.returnStatus
                            ? `${order.orderStatus} / ${order.returnStatus}`
                            : order.orderStatus}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <Link
                          to={`/trackorder?orderId=${encodeURIComponent(
                            order.orderId || order._id
                          )}`}
                          className="text-blue-600 font-medium hover:underline"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Wishlist Preview</h2>
              <Link to="/wishlist" className="text-blue-600 font-medium text-sm">
                See All
              </Link>
            </div>
            {wishlistPreview.length === 0 ? (
              <p className="text-sm text-slate-500">
                Your wishlist is empty right now.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wishlistPreview.map((item) => (
                  <Link
                    key={item._id}
                    to={`/product/${item._id}`}
                    className="rounded-2xl border border-slate-200 p-4 transition hover:shadow-lg"
                  >
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className="h-44 w-full rounded-xl object-cover bg-slate-50"
                    />
                    <h3 className="mt-3 font-semibold text-slate-900 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{item.category}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-semibold text-[#070A52]">
                        {formatCurrency(item.price || 0)}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          Number(item.stock || 0) > 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {Number(item.stock || 0) > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Stock Alerts</h2>
              <Link
                to="/notifications"
                className="text-blue-600 font-medium text-sm"
              >
                Notifications
              </Link>
            </div>
            {alertPreview.length === 0 ? (
              <p className="text-sm text-slate-500">
                You are not waiting on any out-of-stock products right now.
              </p>
            ) : (
              <div className="space-y-4">
                {alertPreview.map((alert) => {
                  const product = alert.productId;
                  return (
                    <div
                      key={alert._id}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex gap-4">
                        <img
                          src={product?.images?.[0] || product?.image}
                          alt={product?.name}
                          className="h-20 w-20 rounded-xl object-cover bg-slate-50"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">
                            {product?.name || "Product"}
                          </h3>
                          <p className="mt-1 text-sm text-slate-500">
                            {product?.category}
                          </p>
                          <p className="mt-2 text-xs font-semibold text-amber-600">
                            {Number(product?.stock || 0) > 0
                              ? "Back in stock now"
                              : "Waiting for restock"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          to={product?._id ? `/product/${product._id}` : "#"}
                          className="rounded-full bg-[#070A52] px-4 py-2 text-xs font-semibold text-white"
                        >
                          View Product
                        </Link>
                        <button
                          onClick={() => handleRemoveAlert(product?._id)}
                          className="rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700"
                        >
                          Remove Alert
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
