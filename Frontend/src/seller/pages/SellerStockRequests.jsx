import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BellRing, Package, RefreshCw, Search, Users } from "lucide-react";
import SellerNavbar from "../components/SellerNavbar";
import SellerFooter from "../components/SellerFooter";
import { useSellerAuth } from "../context/SellerAuthContext";

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

function SummaryCard({ icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function SellerStockRequests() {
  const { token } = useSellerAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState({
    totalRequests: 0,
    activeRequests: 0,
    notifiedRequests: 0,
    requestedProducts: 0,
  });
  const [requests, setRequests] = useState([]);

  const loadRequests = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/sellers/notifications/stock-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load stock requests.");
      setSummary(data.summary || {});
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (err) {
      setError(err.message || "Failed to load stock requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [token]);

  const filteredRequests = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return requests;
    return requests.filter((item) =>
      [
        item.productName,
        item.category,
        item.subCategory,
        item.user?.fullName,
        item.user?.email,
        item.user?.phone,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }, [requests, query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f6fc] via-white to-[#f4f8ff]">
      <SellerNavbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_24px_60px_rgba(67,32,138,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-violet-700">
                <BellRing className="w-3.5 h-3.5" />
                Stock Alert Requests
              </div>
              <h1 className="mt-3 text-3xl font-bold text-[#440077]">Notify-Me Requests</h1>
              <p className="mt-1 text-sm text-slate-500">
                See which users asked to be notified when your products come back in stock.
              </p>
            </div>
            <button
              onClick={loadRequests}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#440077] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#5c27fe]"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <SummaryCard icon={<BellRing className="w-5 h-5" />} label="Total Requests" value={summary.totalRequests || 0} tone="text-[#440077]" />
            <SummaryCard icon={<Users className="w-5 h-5" />} label="Active Requests" value={summary.activeRequests || 0} tone="text-emerald-600" />
            <SummaryCard icon={<Package className="w-5 h-5" />} label="Products Requested" value={summary.requestedProducts || 0} tone="text-amber-600" />
            <SummaryCard icon={<RefreshCw className="w-5 h-5" />} label="Already Notified" value={summary.notifiedRequests || 0} tone="text-sky-600" />
          </div>

          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by product, user, email or phone"
                className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>
            <p className="text-sm text-slate-500">
              {filteredRequests.length} request{filteredRequests.length === 1 ? "" : "s"} visible
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-500">Loading stock requests...</div>
          ) : error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <p className="text-lg font-semibold text-slate-700">No stock requests found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Once users tap Notify Me on out-of-stock products, they will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4">
                      <img
                        src={request.productImage || "https://cdn-icons-png.flaticon.com/512/2577/2577048.png"}
                        alt={request.productName}
                        className="h-20 w-20 rounded-2xl border border-slate-200 object-cover bg-slate-50"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-[#440077]">{request.productName}</h3>
                        <p className="text-sm text-slate-500">
                          {request.category}
                          {request.subCategory ? ` / ${request.subCategory}` : ""}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                            Current stock: {request.stock}
                          </span>
                          <span className={`rounded-full px-3 py-1 font-semibold ${request.active ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"}`}>
                            {request.active ? "Waiting for restock" : "User notified"}
                          </span>
                          {request.variant ? (
                            <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                              Variant: {request.variant}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-slate-600 md:text-right">
                      <p><span className="font-semibold">Requested:</span> {new Date(request.requestedAt).toLocaleString("en-IN")}</p>
                      <p><span className="font-semibold">Notified:</span> {request.notifiedAt ? new Date(request.notifiedAt).toLocaleString("en-IN") : "Not yet"}</p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Requested By</p>
                    <div className="mt-2 grid gap-2 md:grid-cols-3 text-sm text-slate-700">
                      <p><span className="font-semibold">Name:</span> {request.user?.fullName || "Unknown"}</p>
                      <p><span className="font-semibold">Email:</span> {request.user?.email || "N/A"}</p>
                      <p><span className="font-semibold">Phone:</span> {request.user?.phone || "N/A"}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SellerFooter />
    </div>
  );
}
