import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Bell,
  Heart,
  User as UserIcon,
  Search as SearchIcon,
  LogOut,
  UserCircle2,
  PackageSearch,
  Menu,
  X,
  ChevronRight,
  PackageOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import urbanTalesLogo from "../assets/UrbanTales.png";
import { clearUserAuth, getStoredUser, getStoredUserToken } from "../utils/authStorage";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  {
    label: "Fashion",
    href: "/category?cat=fashion",
    links: ["Men", "Women", "Kids", "Accessories", "Luggages"],
  },
  {
    label: "Electronics",
    href: "/category?cat=electronic",
    links: ["Laptops", "Tablets", "Cameras", "Headphones", "Smartwatches"],
  },
  {
    label: "Home & Furniture",
    href: "/category?cat=furniture",
    links: ["Living Room", "Bedroom", "Kitchen", "Office", "Outdoor"],
  },
  { label: "Appliances", href: "/category?cat=kitchen" },
  {
    label: "Toys",
    href: "/category?cat=toys",
    links: ["Action Figures", "Dolls", "Puzzles", "Board Games"],
  },
  { label: "Cosmetics", href: "/category?cat=cosmetic" },
  { label: "Kilos", href: "/category?cat=food" },
  { label: "Sports", href: "/category?cat=sports" },
];

const getCatFromHref = (href = "") => {
  const m = href.match(/cat=([^&#]+)/i);
  return m ? decodeURIComponent(m[1]) : undefined;
};

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/* ---------- ProfileMenu ---------- */
function ProfileMenu({ user, onLogin, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center gap-2">
      {user && user.name && (
        <span className="text-gray-800 font-medium hidden sm:inline">
          Hi, {user.name}
        </span>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="relative w-10 h-10 flex items-center justify-center rounded-full bg-[#070A52] hover:scale-105 transition overflow-hidden"
      >
        {user && user.profileImage ? (
          <img
            src={user.profileImage}
            alt="User avatar"
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <UserIcon className="w-5 h-5 text-white" strokeWidth={2} />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl p-1 text-sm text-gray-700 z-50 border border-gray-100">
          {user ? (
            <>
              <Link
                to="/profile"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition"
                onClick={() => setOpen(false)}
              >
                <UserCircle2 className="w-4 h-4" /> Profile
              </Link>
              <Link
                to="/trackorder"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition"
                onClick={() => setOpen(false)}
              >
                <PackageSearch className="w-4 h-4" /> Orders
              </Link>
              <Link
                to="/wishlist"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition"
                onClick={() => setOpen(false)}
              >
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
              <button
                type="button"
                className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition text-left text-red-600"
                onClick={() => {
                  setOpen(false);
                  onLogout?.();
                }}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <button
              type="button"
              className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100 rounded-md transition text-left"
              onClick={() => {
                setOpen(false);
                onLogin?.();
              }}
            >
              <UserCircle2 className="w-4 h-4" /> Login / Sign Up
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- DesktopCategory ---------- */
function DesktopCategory({ item }) {
  const hasSubs = Array.isArray(item.links) && item.links.length > 0;
  const baseCat = getCatFromHref(item.href);

  return (
    <li className="relative group">
      <NavLink
        to={item.href || "#"}
        className={({ isActive }) =>
          cn(
            "px-1 py-0.5 transition-colors duration-150 flex items-center gap-1",
            isActive ? "text-yellow-300" : "text-white hover:text-yellow-300"
          )
        }
      >
        {item.label}
        {hasSubs && <span aria-hidden="true">▾</span>}
      </NavLink>
      {hasSubs && (
        <ul className="absolute left-0 mt-2 bg-white text-gray-800 rounded-md shadow-lg z-50 py-2 px-3 min-w-[12rem] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {item.links.map((sub, subIdx) => (
            <li key={subIdx} className="py-1 px-1 rounded">
              <Link
                to={`/category?cat=${encodeURIComponent(
                  baseCat ?? ""
                )}&sub=${encodeURIComponent(sub)}`}
                className="block w-full rounded px-2 py-1 hover:bg-[#070A52] hover:text-white transition"
              >
                {sub}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ---------- MobileSidebarCategory ---------- */
function MobileSidebarCategory({ item, onNavigate }) {
  const [expanded, setExpanded] = useState(false);
  const hasSubs = Array.isArray(item.links) && item.links.length > 0;
  const baseCat = getCatFromHref(item.href);

  return (
    <div className="border-b border-gray-200">
      <div
        className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer"
        onClick={() => {
          if (hasSubs) {
            setExpanded(!expanded);
          } else {
            onNavigate(item.href);
          }
        }}
      >
        <span className="text-gray-800 font-medium">{item.label}</span>
        {hasSubs && (
          <ChevronRight
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expanded ? "rotate-90" : ""
            }`}
          />
        )}
      </div>

      <AnimatePresence>
        {hasSubs && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden bg-gray-50"
          >
            {item.links.map((sub, idx) => (
              <div
                key={idx}
                className="px-8 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                onClick={() =>
                  onNavigate(
                    `/category?cat=${encodeURIComponent(
                      baseCat ?? ""
                    )}&sub=${encodeURIComponent(sub)}`
                  )
                }
              >
                {sub}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- SearchBar (Fixed dropdown + outside click close + reopen on click) ---------- */
function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ut_recent_search") || "[]");
    } catch {
      return [];
    }
  });

  const [suggestions, setSuggestions] = useState([]);
  const [loadingSug, setLoadingSug] = useState(false);

  const navigate = useNavigate();

  const wrapRef = React.useRef(null); // ✅ input + dropdown wrapper (dropdown is fixed but still inside component tree)
  const inputRef = React.useRef(null);
  const debounceRef = React.useRef(null);
  const typedRef = React.useRef(""); // ✅ user typed text (never overwritten)

  // ✅ fixed dropdown position
  const [dropPos, setDropPos] = useState({ left: 0, top: 0, width: 0 });

  const closeDropdown = React.useCallback(() => {
    setOpen(false);
    setActive(-1);
  }, []);

  const updateDropdownPos = React.useCallback(() => {
    const el = inputRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const left = Math.max(8, Math.min(r.left, window.innerWidth - r.width - 8));
    const top = r.bottom + 8;

    setDropPos({ left, top, width: r.width });
  }, []);

  // ✅ close on outside click (anywhere except searchbar/dropdown)
  useEffect(() => {
    const handler = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) closeDropdown();
    };

    // capture phase = reliable
    document.addEventListener("pointerdown", handler, true);
    return () => document.removeEventListener("pointerdown", handler, true);
  }, [closeDropdown]);

  // ✅ close on scroll
  useEffect(() => {
    if (!open) return;

    const onAnyScroll = () => closeDropdown();
    window.addEventListener("wheel", onAnyScroll, { passive: true });
    window.addEventListener("touchmove", onAnyScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", onAnyScroll);
      window.removeEventListener("touchmove", onAnyScroll);
    };
  }, [open, closeDropdown]);

  // ✅ keep fixed dropdown aligned while open
  useEffect(() => {
    if (!open) return;

    const onMove = () => updateDropdownPos();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);

    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, updateDropdownPos]);

  const saveRecent = (q) => {
    const clean = (q || "").trim();
    if (!clean) return;
    const next = [clean, ...recent.filter((x) => x !== clean)].slice(0, 6);
    setRecent(next);
    localStorage.setItem("ut_recent_search", JSON.stringify(next));
  };

  const clearRecent = () => {
    setRecent([]);
    localStorage.removeItem("ut_recent_search");
  };

  const runTypedSearch = (q) => {
    const clean = (q || "").trim();
    if (!clean) return;
    saveRecent(clean);
    closeDropdown();
    if (onSearch) onSearch(clean);
    else navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  const openProduct = (p) => {
    if (!p?._id) return;
    saveRecent((typedRef.current || query || "").trim());
    closeDropdown();
    navigate(`/product/${p._id}`);
  };

  // ---------- "AI Search" fallback (typo-friendly without backend change) ----------
  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .replace(/(.)\1{2,}/g, "$1$1");

  const aiQueries = (q) => {
    const n = normalize(q);
    if (!n) return [];
    const tokens = n.split(" ").filter(Boolean);

    const out = new Set();
    out.add(n);
    out.add(n.replace(/\s/g, ""));
    if (n.length >= 4) out.add(n.slice(0, n.length - 1));
    if (n.length >= 4) out.add(n.slice(0, 4));

    tokens.forEach((t) => {
      if (t.length >= 3) out.add(t);
      if (t.length >= 4) out.add(t.slice(0, 3));
      if (t.length >= 5) out.add(t.slice(0, 4));
    });

    return Array.from(out).slice(0, 8);
  };

  const fetchSearch = async (q) => {
    const res = await fetch(
      `${BASE_API_URL}/api/products/search?q=${encodeURIComponent(q)}`
    );
    const data = await res.json();
    if (!res.ok) return [];
    return Array.isArray(data) ? data : [];
  };

  // ✅ suggestions fetch (debounce). Also show default suggestions when empty.
  useEffect(() => {
    if (!open) return;

    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setLoadingSug(true);

        // empty input -> default suggestions
        if (!q) {
          let base = await fetchSearch("a");
          if (!base.length) base = await fetchSearch("s");
          setSuggestions(base.slice(0, 6));
          return;
        }

        // normal suggestions
        let base = await fetchSearch(q);

        // fallback if none
        if (!base.length) {
          const tries = aiQueries(q);
          const merged = new Map();

          for (const t of tries) {
            const res = await fetchSearch(t);
            for (const p of res) if (p && p._id) merged.set(p._id, p);
            if (merged.size >= 10) break;
          }

          base = Array.from(merged.values());
        }

        setSuggestions(base.slice(0, 6));
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSug(false);
      }
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [query, open]);

  // ✅ IMPORTANT: reopen dropdown whenever you click/focus input
  const openDropdown = () => {
    typedRef.current = query;
    setActive(-1);
    updateDropdownPos();

    // force reopen even if state already true
    setOpen(false);
    requestAnimationFrame(() => setOpen(true));
  };

  const onChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    typedRef.current = val;
    setActive(-1);
    updateDropdownPos();
    setOpen(true);
  };

  const onKeyDown = (e) => {
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !open) {
      updateDropdownPos();
      setOpen(true);
    }

    const isTyping = !!typedRef.current.trim();
    const list = isTyping ? suggestions : recent;

    if (e.key === "Escape") {
      closeDropdown();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!list.length) return;
      setActive((v) => (v + 1 > list.length - 1 ? 0 : v + 1)); // wrap down
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!list.length) return;

      // first -> focus input (no wrap up)
      setActive((v) => {
        if (v <= 0) {
          requestAnimationFrame(() => inputRef.current?.focus());
          return -1;
        }
        return v - 1;
      });
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (typedRef.current.trim() && suggestions.length && active >= 0) {
        openProduct(suggestions[active]);
        return;
      }

      if (!typedRef.current.trim() && recent.length && active >= 0) {
        runTypedSearch(recent[active]);
        return;
      }

      runTypedSearch(typedRef.current || query);
    }
  };

  const isTyping = !!typedRef.current.trim();

  return (
    <div ref={wrapRef} className="relative w-full z-[9999] isolate">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runTypedSearch(typedRef.current || query);
        }}
        className="relative w-full"
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={onChange}
          onFocus={openDropdown}
          onClick={openDropdown} // ✅ reopen on click too
          onKeyDown={onKeyDown}
          placeholder="Search for products..."
          className="w-full pl-10 pr-20 py-2.5 border border-gray-300 rounded-full shadow-sm placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-[#070A52] focus:border-[#070A52] text-sm"
        />

        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />

        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white
                     bg-[#070A52] hover:bg-[#0A0F6D] px-4 py-1.5 rounded-full transition"
        >
          Go
        </button>
      </form>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[9999] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
            style={{
              left: dropPos.left,
              top: dropPos.top,
              width: dropPos.width,
            }}
          >
            {/* Recent */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recent Searches
                </p>

                {recent.length > 0 && (
                  <button
                    type="button"
                    onClick={clearRecent}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Clear
                  </button>
                )}
              </div>

              {recent.length === 0 ? (
                <p className="text-sm text-gray-500 px-1 py-2">
                  No recent searches
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {recent.map((r, idx) => (
                    <button
                      key={r}
                      type="button"
                      onMouseEnter={() => setActive(isTyping ? -1 : idx)}
                      onClick={() => runTypedSearch(r)}
                      className={`px-3 py-1.5 rounded-full border text-sm transition ${
                        !isTyping && active === idx
                          ? "border-[#070A52] bg-gray-200/70 text-[#070A52]"
                          : "border-gray-200 bg-gray-100 hover:bg-gray-200/60"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="p-2 border-t border-gray-200">
              <div className="px-2 py-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Suggestions
                </p>
                {loadingSug && (
                  <span className="text-xs text-gray-400">loading…</span>
                )}
              </div>

              {!loadingSug && suggestions.length === 0 ? (
                <p className="text-sm text-gray-500 px-3 py-2">
                  No suggestions
                </p>
              ) : (
                <div className="max-h-80 overflow-auto">
                  {suggestions.map((p, idx) => (
                    <button
                      key={p._id || idx}
                      type="button"
                      onMouseEnter={() => setActive(isTyping ? idx : -1)}
                      onClick={() => openProduct(p)}
                      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl transition ${
                        isTyping && active === idx
                          ? "bg-gray-200/70"
                          : "hover:bg-gray-200/60"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {p?.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <PackageOpen className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {p.category} • ₹{p.price}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




/* ---------- Badge ---------- */
function Badge({ count }) {
  if (!count || count <= 0) return null;
  const display = count > 99 ? "99+" : String(count);
  return (
    <span className="absolute -top-1 -right-1 min-w-[1.125rem] h-4 px-1 rounded-full bg-red-600 text-[10px] leading-4 text-white text-center font-bold">
      {display}
    </span>
  );
}

/* ---------- Navbar ---------- */
const Navbar = ({ cartCount, onSearch, notificationCount }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifQty, setNotifQty] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // user load
  useEffect(() => {
    try {
      const storedUser = getStoredUser();
      const token = getStoredUserToken();
      if (storedUser && token) setUser(storedUser);
    } catch {
      // ignore
    }
  }, []);

  // notifications unread count (if parent ne prop nahi diya)
  useEffect(() => {
    if (typeof notificationCount === "number") {
      setNotifQty(notificationCount);
      return;
    }

    const token = getStoredUserToken();
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setNotifQty(data.count || 0);
      } catch {
        // ignore
      }
    };

    fetchCount();
    const id = setInterval(fetchCount, 30000);
    return () => clearInterval(id);
  }, [notificationCount]);

  const cartQty = cartCount || Number(localStorage.getItem("cartCount") || 0);

  const handleLogin = () => navigate("/login");
  const handleLogout = () => {
    clearUserAuth();
    setUser(null);
    navigate("/");
  };

  const handleSidebarNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-white shadow-md font-inter">
        {/* Top Row */}
        <div className="px-4 md:px-6 h-16 md:h-20 flex items-center justify-between gap-3 md:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo */}
          <img
            src={urbanTalesLogo}
            alt="UrbanTales logo"
            className="h-12 md:h-16 w-auto object-contain cursor-pointer"
            onClick={() => navigate("/")}
          />

          {/* Search - Hidden on small screens */}
          <div className="hidden md:flex flex-1 justify-center max-w-2xl">
            <SearchBar onSearch={onSearch} />
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:block">
              <ProfileMenu
                user={user}
                onLogin={handleLogin}
                onLogout={handleLogout}
              />
            </div>

            {/* Cart */}
            <Link
              to="/cartpage"
              className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-white bg-[#070A52] hover:scale-105 transition"
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              <Badge count={cartQty} />
            </Link>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center rounded-full text-white bg-[#070A52] hover:scale-105 transition"
            >
              <Bell className="w-4 h-4 md:w-5 md:h-5" />
              <Badge count={notifQty} />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <SearchBar onSearch={onSearch} />
        </div>

        {/* Desktop Category Bar */}
        <div className="hidden lg:block pb-3 px-6">
          <div className="bg-[#070A52] text-white text-center py-2 px-4 rounded-full font-semibold shadow-md">
            <ul className="flex flex-wrap justify-center items-center gap-10">
              {NAV_ITEMS.map((item) => (
                <DesktopCategory key={item.label} item={item} />
              ))}
            </ul>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto lg:hidden"
            >
              {/* Sidebar Header */}
              <div className="bg-gradient-to-r from-[#070A52] to-[#0d1170] p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={urbanTalesLogo}
                    alt="UrbanTales"
                    className="h-10 w-auto object-contain"
                  />
                  <span className="text-white font-bold text-xl">Menu</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* User Profile Section */}
              <div className="border-b border-gray-200 p-4">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#070A52] flex items-center justify-center overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleLogin();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition"
                  >
                    <UserCircle2 className="w-5 h-5" />
                    Login / Sign Up
                  </button>
                )}
              </div>

              {/* Quick Links */}
              {user && (
                <div className="border-b border-gray-200 p-4 space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <UserCircle2 className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      My Profile
                    </span>
                  </Link>
                  <Link
                    to="/trackorder"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <PackageSearch className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      My Orders
                    </span>
                  </Link>
                  <Link
                    to="/wishlist"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Heart className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Wishlist
                    </span>
                  </Link>
                  <Link
                    to="/cartpage"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">My Cart</span>
                    {cartQty > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {cartQty}
                      </span>
                    )}
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      Notifications
                    </span>
                    {notifQty > 0 && (
                      <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {notifQty}
                      </span>
                    )}
                  </Link>
                </div>
              )}

              {/* Categories */}
              <div className="py-4">
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </h3>
                {NAV_ITEMS.map((item) => (
                  <MobileSidebarCategory
                    key={item.label}
                    item={item}
                    onNavigate={handleSidebarNavigate}
                  />
                ))}
              </div>

              {/* Logout Button */}
              {user && (
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleLogout();
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </div>
              )}

              {/* Footer Info */}
              <div className="p-4 text-center text-sm text-gray-500">
                <p>© 2026 UrbanTales</p>
                <p className="text-xs mt-1">Shop with confidence</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
