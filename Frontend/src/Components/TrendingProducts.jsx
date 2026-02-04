import React, { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

const products = [
  {
    name: "Wireless Headphones",
    desc: "Noise-cancelling with 30 hours battery life.",
    img: "https://i.pinimg.com/736x/8c/db/e1/8cdbe123010c380e20f264a8fdd57938.jpg",
    href: "/product/6983078ba2507edaf4c6341a",
  },
  {
    name: "Fitness Band",
    desc: "Track workouts, sleep, and heart rate.",
    img: "https://i.pinimg.com/736x/d4/39/13/d43913c7eba213b38eff4bbd8812303b.jpg",
    href: "/product/698307cda2507edaf4c63429",
  },
  {
    name: "4K Smart TV",
    desc: "Smart apps and vibrant visuals.",
    img: "https://i.pinimg.com/736x/b7/0d/aa/b70daaa7cbd8b252c63ef180eb5e1608.jpg",
    href: "/product/69830807a2507edaf4c63435",
  },
  {
    name: "Office Chair",
    desc: "Ergonomic and breathable for long workdays.",
    img: "https://i.pinimg.com/736x/7a/3c/5c/7a3c5ca272bf8f2e4b2ad7c0f2d97632.jpg",
    href: "/product/6983083ba2507edaf4c63441",
  },
  {
    name: "Analog Watch",
    desc: "Minimalist leather strap wristwatch.",
    img: "https://i.pinimg.com/736x/9f/28/ec/9f28ecf9eb6d0aa6d8273d2070444b95.jpg",
    href: "/product/69830876a2507edaf4c6344f",
  },
  {
    name: "Portable Blender",
    desc: "Rechargeable on-the-go smoothie maker.",
    img: "https://i.pinimg.com/736x/0e/3a/ae/0e3aae87c04d0bb998d1fdc069596eab.jpg",
    href: "/product/698308c7a2507edaf4c63460",
  },
  {
    name: "LED Strip Lights",
    desc: "Smart multicolor ambiance with remote.",
    img: "https://i.pinimg.com/736x/36/1f/f8/361ff84684094557c5c5e42e3fd8e761.jpg",
    href: "/product/698308f6a2507edaf4c6346d",
  },
  {
    name: "Eco Water Bottle",
    desc: "Reusable and keeps cold for 24 hrs.",
    img: "https://i.pinimg.com/736x/b3/9b/f4/b39bf4589291b85da295b735dc8c1336.jpg",
    href: "/product/6983093ea2507edaf4c6347b",
  },
  {
    name: "Charging Stand",
    desc: "Wireless fast charging dock.",
    img: "https://i.pinimg.com/736x/f5/9d/00/f59d0051f94b71d26500529a02c018d3.jpg",
    href: "/product/69830970a2507edaf4c6348a",
  },
  {
    name: "Gaming Mouse",
    desc: "RGB lighting with adjustable DPI.",
    img: "https://i.pinimg.com/736x/65/84/17/6584175af17d1067d0259f42611d15aa.jpg",
    href: "/product/698309aea2507edaf4c63497",
  },
];

const TrendingProducts = () => {
  const navigate = useNavigate();
  const trackRef = useRef(null);

  const loopItems = useMemo(() => [...products, ...products], []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) return;

    let rafId = 0;
    let paused = false;
    const speed = 0.6;

    const pause = () => (paused = true);
    const resume = () => (paused = false);

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);

    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("pointercancel", resume);

    const ensureReady = () => {
      const half = Math.floor(el.scrollWidth / 2);
      if (half > 0 && el.scrollLeft >= half) el.scrollLeft = 1; // ✅ avoid sticky start
    };

    const t = setTimeout(ensureReady, 250);

    const step = () => {
      if (!paused) {
        el.scrollLeft += speed;

        const half = Math.floor(el.scrollWidth / 2);

        if (half > 0 && el.scrollLeft >= half) {
          el.scrollLeft = el.scrollLeft - half + 1; // ✅ seamless + safe
        }
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafId);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("pointercancel", resume);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#F9FAFB] py-16 px-4">
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#070A52]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#070A52] tracking-wide">
              Trending on social media
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              What people are loving right now ✨
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Auto-sliding
          </div>
        </div>

        <div
          ref={trackRef}
          className="relative flex gap-5 overflow-x-auto no-scrollbar pb-3 pr-2"
          aria-label="Trending products carousel"
        >
          {loopItems.map((product, index) => (
            <button
              key={`${product.href}-${index}`}
              type="button"
              onClick={() => navigate(product.href)}
              className="
                group relative min-w-[260px] sm:min-w-[300px] md:min-w-[340px]
                h-[360px] sm:h-[400px]
                rounded-2xl overflow-hidden flex-shrink-0 text-left
                border border-gray-200 bg-white shadow-sm
                hover:shadow-xl hover:-translate-y-1
                transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-[#070A52]/30
              "
              aria-label={`Open ${product.name}`}
            >
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${product.img}')` }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10" />

              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20">
                  Trending
                </span>
              </div>

              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 ring-1 ring-white/20" />

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-lg font-semibold text-white drop-shadow">
                  {product.name}
                </p>
                <p className="text-sm text-white/80 mt-1 line-clamp-2">
                  {product.desc}
                </p>

                <div className="mt-4 inline-flex items-center gap-2 text-xs text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  Tap to view product
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};

export default TrendingProducts;
