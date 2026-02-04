import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import ai from "../assets/ai.gif";
import AII from "../assets/AII.png";
import { ShopContext } from "../context/ShopContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import openSoundFile from "../assets/open.mp3";

/**
 * ✅ FINAL BEST AI (Clean Version)
 * - Removed: Admin pages, Seller pages (except /seller-onboarding)
 * - Keeps: Home, About, Contact, Cart, TrackOrder, HelpCenter, Login, Register, Welcome, Notifications
 * - Keeps: Category voice redirects (fashion/electronic/furniture/kitchen/toys/cosmetic/food/sports)
 */

const HIDE_AI_ON = []; // keep empty if you want AI everywhere
const FIRST_TIP_KEY = "urbantales_ai_tip_seen_v1";

function Ai() {
  const { setShowSearch } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [activeAi, setActiveAi] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Stable audio
  const audioRef = useRef(null);
  useEffect(() => {
    audioRef.current = new Audio(openSoundFile);
    audioRef.current.volume = 0.9;
  }, []);

  // Start lock to prevent double-start crash
  const startingRef = useRef(false);

  // Speak helper
  const speak = (message) => {
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(message);
      utter.rate = 1.0;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {}
  };

  // Create recognition once
  const recognition = useMemo(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;
    const r = new SR();
    r.lang = "en-IN";
    r.interimResults = false;
    r.maxAlternatives = 1;
    return r;
  }, []);

  // Hide AI on selected pages
  const shouldHide = HIDE_AI_ON.includes(location.pathname);
  if (shouldHide) return null;

  if (!recognition) {
    console.warn("Speech Recognition not supported in this browser.");
    return null;
  }

  // First-time tip
  useEffect(() => {
    const seen = localStorage.getItem(FIRST_TIP_KEY);
    if (!seen) {
      setShowTip(true);
      const t = setTimeout(() => {
        setShowTip(false);
        localStorage.setItem(FIRST_TIP_KEY, "1");
      }, 5500);
      return () => clearTimeout(t);
    }
  }, []);

  // Normalize transcript (✅ keep login/register words safe)
  const normalize = (s) => {
    return (s || "")
      .toLowerCase()
      .trim()
      .replace(/[^\w\s?]/g, " ")
      .replace(
        /\b(please|pls|kindly|open|go to|show|take me to|navigate to|launch|start|chal|chalo|dikhao|kholo|le chalo|page|section|category)\b/g,
        " "
      )
      .replace(/\s+/g, " ")
      .trim();
  };

  // Category rules
  const CATEGORY_RULES = useMemo(
    () => [
      {
        cat: "fashion",
        say: "Opening fashion category",
        keys: ["fashion", "clothes", "clothing", "kurti", "kurtis", "tshirt", "t shirt", "shirt", "jeans", "dress", "outfit", "style", "kapde", "kapda", "wear"],
      },
      {
        cat: "electronic",
        say: "Opening electronics category",
        keys: ["electronic", "electronics", "gadget", "gadgets", "headphone", "headphones", "tv", "smart tv", "mouse", "keyboard", "mobile", "phone", "laptop", "charger", "earbuds", "watch", "smartwatch"],
      },
      {
        cat: "furniture",
        say: "Opening furniture category",
        keys: ["furniture", "sofa", "chair", "table", "bed", "almirah", "cabinet", "wardrobe", "home furniture", "office chair", "ghar ka furniture", "ghar furniture"],
      },
      {
        cat: "kitchen",
        say: "Opening kitchen category",
        keys: ["kitchen", "appliance", "appliances", "cooking", "cook", "blender", "mixer", "cutting board", "utensils", "microwave", "kitchen items", "rasoi", "rasoi ke"],
      },
      {
        cat: "toys",
        say: "Opening toys category",
        keys: ["toy", "toys", "kids", "kid", "children", "games", "teddy", "bacche", "bache"],
      },
      {
        cat: "cosmetic",
        say: "Opening cosmetics category",
        keys: ["cosmetic", "cosmetics", "makeup", "beauty", "skincare", "lipstick", "foundation", "cream", "perfume", "fragrance", "cosmetics items", "make up"],
      },
      {
        cat: "food",
        say: "Opening food category",
        keys: ["food", "grocery", "groceries", "kilos", "fruits", "vegetables", "snacks", "drink", "drinks", "ration", "kirana"],
      },
      {
        cat: "sports",
        say: "Opening sports category",
        keys: ["sports", "sport", "gym", "fitness", "cricket", "football", "badminton", "sportswear", "sports shoes", "workout"],
      },
    ],
    []
  );

  const scoreMatch = (text, keys) => {
    let score = 0;
    for (const k of keys) {
      if (text.includes(k)) score += Math.max(2, k.length >= 6 ? 3 : 2);
    }
    return score;
  };

  // ✅ USER pages + Seller onboarding
  const PAGE_RULES = useMemo(
    () => [
      { say: "Opening home page", path: "/", keys: ["home", "homepage", "landing"] },
      { say: "Opening about page", path: "/about", keys: ["about"] },
      { say: "Opening contact page", path: "/contact", keys: ["contact", "contact us"] },
      { say: "Opening your cart", path: "/cartpage", keys: ["cart", "my cart", "shopping cart"] },
      { say: "Opening order tracking", path: "/trackorder", keys: ["track order", "orders", "my orders", "order status"] },
      { say: "Opening help center", path: "/helpcenter", keys: ["help", "support", "help center"] },

      // ✅ LOGIN (improved)
      { say: "Opening login page", path: "/login", keys: ["login", "log in", "signin", "sign in"] },

      // ✅ REGISTER (improved)
      { say: "Opening register page", path: "/register", keys: ["register", "signup", "sign up", "create account", "new account"] },

      { say: "Opening welcome page", path: "/welcomepage", keys: ["welcome"] },
      { say: "Opening notifications", path: "/notifications", keys: ["notifications", "notification"] },

      // Seller (only this)
      { say: "Opening seller onboarding", path: "/seller-onboarding", keys: ["seller onboarding", "become a seller", "seller", "sell"] },
    ],
    []
  );

  // Stop listening if tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) {
        try {
          recognition.stop();
        } catch {}
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [recognition]);

  useEffect(() => {
    recognition.onstart = () => setActiveAi(true);

    recognition.onresult = (e) => {
      const raw = e?.results?.[0]?.[0]?.transcript || "";
      const cleaned = normalize(raw);

      if (!cleaned) {
        toast.error("Couldn’t hear properly. Try again.");
        return;
      }

      setShowSearch(false);

      // Special: "home and furniture" => furniture
      if ((cleaned.includes("home") && cleaned.includes("furniture")) || cleaned.includes("home furniture")) {
        speak("Opening furniture category");
        navigate("/category?cat=furniture");
        return;
      }

      // Category match
      let bestCat = null;
      let bestScore = 0;
      for (const r of CATEGORY_RULES) {
        const sc = scoreMatch(cleaned, r.keys);
        if (sc > bestScore) {
          bestScore = sc;
          bestCat = r;
        }
      }
      if (bestCat && bestScore >= 2) {
        speak(bestCat.say);
        navigate(`/category?cat=${bestCat.cat}`);
        return;
      }

      // Page match
      const page = PAGE_RULES.find((p) => p.keys.some((k) => cleaned.includes(k)));
      if (page) {
        speak(page.say);
        navigate(page.path);
        return;
      }

      toast.error("Try: fashion, electronics, login, register, cart, orders…");
    };

    recognition.onerror = (e) => {
      setActiveAi(false);

      if (e?.error === "not-allowed" || e?.error === "service-not-allowed") {
        toast.info("Microphone permission allow kar do (Browser settings).");
      } else if (e?.error === "no-speech") {
        toast.info("Kuch bola nahi suna 😅 ek baar phir try karo.");
      } else {
        toast.error("Voice error. Try again.");
      }
    };

    recognition.onend = () => setActiveAi(false);

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, [CATEGORY_RULES, PAGE_RULES, navigate, recognition, setShowSearch]);

  const handleAiClick = () => {
    if (startingRef.current) return;

    try {
      if (activeAi) {
        recognition.stop();
        return;
      }

      startingRef.current = true;
      setTimeout(() => (startingRef.current = false), 350);

      audioRef.current?.play().catch(() => {});
      recognition.start();
    } catch {
      toast.info("Voice assistant not ready. Try again.");
      startingRef.current = false;
    }
  };

  return (
    <button
      type="button"
      onClick={handleAiClick}
      className="
        fixed z-[999999]
        left-3 bottom-3 sm:left-4 sm:bottom-4 lg:left-5 lg:bottom-5

        w-[60px] h-[60px]
        sm:w-[68px] sm:h-[68px]
        lg:w-[74px] lg:h-[74px]
        rounded-full

        bg-white/35 backdrop-blur-2xl   /* ✅ MORE TRANSPARENT */
        border border-white/30
        shadow-[0_16px_45px_rgba(0,0,0,0.18)]
        flex items-center justify-center

        hover:scale-[1.03] active:scale-[0.98]
        transition
      "
      aria-label={activeAi ? "Stop voice assistant" : "Start voice assistant"}
      title={activeAi ? "Listening... Tap to stop" : "Tap and speak"}
    >
      <span className={`absolute inset-0 rounded-full pointer-events-none ${activeAi ? "" : "ai-idle"}`} />
      <span className={`absolute inset-0 rounded-full pointer-events-none ring-1 ring-black/5 ${activeAi ? "ai-ring" : ""}`} />
      <span className={`absolute -inset-2 rounded-full pointer-events-none ${activeAi ? "ai-glow" : "opacity-0"}`} />

      <img
        src={activeAi ? ai : AII}
        alt="AI Assistant"
        className={`
          w-[48px] h-[48px]
          sm:w-[54px] sm:h-[54px]
          lg:w-[60px] lg:h-[60px]
          object-contain select-none
          ${activeAi ? "ai-pulse" : ""}
        `}
        style={{ filter: activeAi ? "drop-shadow(0px 0px 16px rgba(0,210,252,0.85))" : "none" }}
        draggable={false}
      />

      <div
        className={`
          absolute -top-12 left-0
          px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold
          bg-black/75 text-white backdrop-blur-md border border-white/10
          transition
          ${showTip ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
        `}
      >
        Try: “login”, “register”, “fashion”
      </div>

      <div
        className={`
          absolute -top-12 left-0
          px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold
          bg-black/75 text-white backdrop-blur-md border border-white/10
          transition
          ${activeAi ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}
        `}
      >
        Listening...
      </div>

      <style>{`
        .ai-pulse{ animation: aiPulse 1.1s ease-in-out infinite; }
        @keyframes aiPulse{ 0%,100% { transform: scale(1); } 50% { transform: scale(1.08); } }

        .ai-glow{
          opacity: 1;
          background: radial-gradient(circle, rgba(0,210,252,0.22), transparent 65%);
          animation: aiGlow 1.2s ease-in-out infinite;
        }
        @keyframes aiGlow{ 0%,100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.08); opacity: 1; } }

        .ai-ring{ animation: aiRing 1.2s ease-in-out infinite; }
        @keyframes aiRing{ 0%,100% { box-shadow: 0 0 0 0 rgba(0,210,252,0.0); } 50% { box-shadow: 0 0 0 7px rgba(0,210,252,0.10); } }

        .ai-idle{ animation: aiIdle 3.8s ease-in-out infinite; }
        @keyframes aiIdle{ 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

        @media (prefers-reduced-motion: reduce){
          .ai-pulse, .ai-glow, .ai-ring, .ai-idle { animation: none; }
        }
      `}</style>
    </button>
  );
}

export default Ai;