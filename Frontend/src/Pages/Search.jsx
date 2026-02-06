import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  PackageOpen,
  ArrowLeft,
  Filter,
} from "lucide-react";
import urbanTalesLogo from "../assets/UrbanTales.png";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// ✅ Fixed categories (as you asked)
const CATEGORY_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Fashion", value: "fashion" },
  { label: "Electronics", value: "electronic" },
  { label: "Home & Furniture", value: "furniture" },
  { label: "Appliances / Kitchen", value: "kitchen" },
  { label: "Toys", value: "toys" },
  { label: "Cosmetics", value: "cosmetic" },
  { label: "Food / Kilos", value: "food" }, // your "kilos"
  { label: "Sports", value: "sports" },
];

// helpers
const toNumOrEmpty = (v) => {
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "";
};

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-3 overflow-hidden">
      <div className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

function NoImage() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
      <PackageOpen className="w-10 h-10" />
      <p className="text-xs mt-2">No image</p>
    </div>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();

  // ✅ Keyword only from URL (not editable)
  const q = useMemo(() => (params.get("q") || "").trim(), [params]);

  // ✅ Filters from URL
  const catParam = (params.get("cat") || "all").trim();
  const minParam = toNumOrEmpty(params.get("min"));
  const maxParam = toNumOrEmpty(params.get("max"));
  const sortParam = (params.get("sort") || "newest").trim();

  // local states (UI controls) - synced with URL
  const [cat, setCat] = useState(catParam);
  const [minPrice, setMinPrice] = useState(minParam);
  const [maxPrice, setMaxPrice] = useState(maxParam);
  const [sortBy, setSortBy] = useState(sortParam);

  const [filtersOpen, setFiltersOpen] = useState(false);

  // ✅ Tip auto-hide state (10 seconds)
  const [showTip, setShowTip] = useState(true);

  // data
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(12);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // keep controls synced if user opens a shared URL
  useEffect(() => {
    setCat(catParam);
    setMinPrice(minParam);
    setMaxPrice(maxParam);
    setSortBy(sortParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catParam, minParam, maxParam, sortParam]);

  // ✅ Fetch from backend when keyword changes (q changes)
  useEffect(() => {
    const run = async () => {
      if (!q) {
        setItems([]);
        setErr("");
        return;
      }
      setLoading(true);
      setErr("");
      setVisible(12);

      try {
        const res = await fetch(
          `${BASE_API_URL}/api/products/search?q=${encodeURIComponent(q)}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Search failed");
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr(e?.message || "Something went wrong");
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [q]);

  // ✅ Tip auto-hide after 10 seconds whenever q changes
  useEffect(() => {
    if (!q) return;

    setShowTip(true);
    const timer = setTimeout(() => setShowTip(false), 10000);

    return () => clearTimeout(timer);
  }, [q]);

  // ✅ Apply filters client-side (no backend change)
  const filteredSorted = useMemo(() => {
    const minN = minPrice === "" ? null : Number(minPrice);
    const maxN = maxPrice === "" ? null : Number(maxPrice);

    let list = items.slice();

    if (cat && cat !== "all") {
      list = list.filter(
        (p) =>
          String(p.category).toLowerCase() === String(cat).toLowerCase()
      );
    }
    if (minN !== null && Number.isFinite(minN)) {
      list = list.filter((p) => Number(p.price) >= minN);
    }
    if (maxN !== null && Number.isFinite(maxN)) {
      list = list.filter((p) => Number(p.price) <= maxN);
    }

    if (sortBy === "price_asc") {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name_asc") {
      list.sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""))
      );
    } else {
      // newest
      list.sort((a, b) => {
        const da = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });
    }

    return list;
  }, [items, cat, minPrice, maxPrice, sortBy]);

  const shown = filteredSorted.slice(0, visible);
  const hasMore = visible < filteredSorted.length;

  // ✅ URL system: whenever filters change, reflect in URL
  useEffect(() => {
    // keep q as it is
    const next = new URLSearchParams(params);

    // cat
    if (cat && cat !== "all") next.set("cat", cat);
    else next.delete("cat");

    // min / max
    if (minPrice !== "") next.set("min", String(minPrice));
    else next.delete("min");

    if (maxPrice !== "") next.set("max", String(maxPrice));
    else next.delete("max");

    // sort
    if (sortBy && sortBy !== "newest") next.set("sort", sortBy);
    else next.delete("sort");

    // avoid unnecessary setParams loops
    const current = params.toString();
    const updated = next.toString();
    if (current !== updated) setParams(next, { replace: true });

    // reset visible when filters change
    setVisible(12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat, minPrice, maxPrice, sortBy]);

  const clearFilters = () => {
    setCat("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white">
      {/* ✅ Fixed compact top bar (NO INPUT) */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-3 md:px-6 py-3">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <img
                src={urbanTalesLogo}
                alt="UrbanTales"
                className="h-9 w-auto object-contain cursor-pointer"
                onClick={() => navigate("/")}
                title="Go Home"
              />

              {/* Keyword display */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <SearchIcon className="w-4 h-4 text-[#070A52]" />
                  <p className="font-bold text-gray-900 text-sm md:text-base truncate">
                    Search Results
                  </p>
                </div>

                <p className="text-[11px] md:text-xs text-gray-600 truncate">
                  Keyword:{" "}
                  <span className="font-semibold text-[#070A52]">
                    {q || "—"}
                  </span>
                  <span className="mx-2 text-gray-300">•</span>
                  Showing{" "}
                  <span className="font-semibold text-gray-900">
                    {filteredSorted.length}
                  </span>
                </p>

                {/* ✅ Tip message (auto hides after 10 seconds) */}
                <AnimatePresence>
  {q && showTip && (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.2 }}
      className="mt-2 flex flex-wrap items-center gap-2"
    >
      <motion.span
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(7,10,82,0)",
            "0 0 0 3px rgba(7,10,82,0.35)",
            "0 0 0 0 rgba(7,10,82,0)",
          ], // ✅ border-like blink (chip outline)
        }}
        transition={{
          duration: 0.7,
          repeat: Infinity,
          repeatType: "loop",
        }}
        className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] md:text-xs text-[#070A52] font-semibold"
      >
        Tip: Please select the appropriate filters and choose the correct
        category.
      </motion.span>
    </motion.div>
  )}
</AnimatePresence>

              </div>

              {/* Filter toggle */}
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition text-sm font-semibold text-gray-800"
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>

              {/* Back */}
              <button
                onClick={() => window.history.back()}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition text-sm font-semibold text-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>

            {/* Filters panel */}
            <AnimatePresence>
              {filtersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                    {/* Category */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Category
                      </p>
                      <select
                        value={cat}
                        onChange={(e) => setCat(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#070A52]"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Min */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Min Price
                      </p>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="0"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#070A52]"
                      />
                    </div>

                    {/* Max */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Max Price
                      </p>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="99999"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#070A52]"
                      />
                    </div>

                    {/* Sort */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Sort
                      </p>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#070A52]"
                      >
                        <option value="newest">Newest</option>
                        <option value="price_asc">Price: Low → High</option>
                        <option value="price_desc">Price: High → Low</option>
                        <option value="name_asc">Name: A → Z</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 rounded-2xl border border-gray-200 bg-white hover:bg-gray-50 transition text-sm font-semibold text-gray-800"
                    >
                      Clear Filters
                    </button>

                    <button
                      onClick={() => setFiltersOpen(false)}
                      className="px-4 py-2 rounded-2xl bg-[#070A52] text-white hover:opacity-95 transition text-sm font-semibold"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error banner */}
            <AnimatePresence>
              {err && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="pt-3"
                >
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-red-700 text-sm">
                    {err}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Content padding for fixed bar (more if filters open) */}
      <div
        className={`px-4 md:px-8 py-6 ${
          filtersOpen ? "pt-[210px]" : "pt-[92px]"
        }`}
      >
        <div className="max-w-6xl mx-auto">
          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* When keyword missing */}
          {!loading && !err && !q && (
            <div className="text-center text-gray-500 mt-10">
              Search keyword missing. Go back and search from Navbar.
            </div>
          )}

          {/* Empty results */}
          {!loading && !err && q && filteredSorted.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#070A52]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl" />

              <div className="relative">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center">
                  <PackageOpen className="w-7 h-7 text-gray-500" />
                </div>
                <h2 className="mt-4 text-lg font-bold text-gray-900">
                  No products found
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Try changing filters (category/price/sort).
                </p>
              </div>
            </motion.div>
          )}

          {/* Results grid */}
          {!loading && !err && shown.length > 0 && (
            <>
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
                }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
              >
                {shown.map((p) => (
                  <motion.div
                    key={p._id}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0 },
                    }}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="h-full"
                  >
                    <Link
                      to={`/product/${p._id}`}
                      className="group block h-full bg-white border border-gray-200 rounded-2xl p-3 hover:shadow-xl transition-shadow"
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                        {p?.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-300"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <NoImage />
                        )}

                        <div className="absolute top-2 left-2">
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-white/85 backdrop-blur border border-gray-200 text-gray-800">
                            {p.category}
                          </span>
                        </div>

                        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#070A52]/10 rounded-full blur-2xl" />
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="font-semibold text-gray-900 line-clamp-1">
                          {p.name}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500 line-clamp-1">
                            {p?.delivery || "Fast delivery"}
                          </span>

                          <span className="font-bold text-[#070A52] bg-[#070A52]/5 border border-[#070A52]/10 px-2 py-1 rounded-lg">
                            ₹{p.price}
                          </span>
                        </div>

                        <div className="mt-3">
                          <span className="inline-flex w-full items-center justify-center rounded-xl bg-[#070A52] text-white text-sm font-semibold py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Details
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => setVisible((v) => v + 12)}
                    className="px-6 py-3 rounded-2xl bg-white border border-gray-200 hover:shadow-md transition font-semibold text-gray-800"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
