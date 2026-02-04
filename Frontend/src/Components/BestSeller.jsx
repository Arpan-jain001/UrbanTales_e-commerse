import React, { useEffect, useRef, useState } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ---------------- DATA ---------------- */
const bestSellers = [
  {
    brand: "RANGMANCH",
    name: "Teal Textured Below Knee Length Kurti",
    price: 779,
    oldPrice: 1299,
    discount: 40,
    image:
      "https://i.pinimg.com/1200x/b2/41/cb/b241cbe49815badd62fb0ce85a0e8ecb.jpg",
    productId: "6983058aa2507edaf4c633bf",
  },
  {
    brand: "RANGMANCH",
    name: "Medium Blue Embroidered Cotton Top",
    price: 844,
    oldPrice: 1299,
    discount: 35,
    image:
      "https://i.pinimg.com/736x/c2/f8/d2/c2f8d2086a829789f2ef09b13f253710.jpg",
    productId: "698305daa2507edaf4c633cf",
  },
  {
    brand: "ANNABELLE",
    name: "Brown Solid Women Flare Pants",
    price: 909,
    oldPrice: 1299,
    discount: 30,
    image:
      "https://i.pinimg.com/736x/27/ee/9b/27ee9be6ec2800f22d7bf64e5124f0cf.jpg",
    productId: "69830633a2507edaf4c633de",
  },
  {
    brand: "Gizelle",
    name: "Two Piece Linen Shirt & Shorts Set",
    price: 1329,
    oldPrice: 1899,
    discount: 30,
    image:
      "https://i.pinimg.com/1200x/fc/9e/7f/fc9e7fcfc2caa56dd8b1768f914efb0a.jpg",
    productId: "6983067ba2507edaf4c633ec",
  },
  {
    brand: "Aveloria",
    name: "Floral Print Button Front Shirt",
    price: 909,
    oldPrice: 1299,
    discount: 30,
    image:
      "https://i.pinimg.com/736x/95/07/06/950706f8458ece429798b9ce6819233f.jpg",
    productId: "698306b6a2507edaf4c633f8",
  },
];

const formatINR = (n) =>
  n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

/* ---------------- MAIN ---------------- */
const BestSellers = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="bg-[#F9FAFB] py-16 px-4">
      <h2 className="text-center text-3xl md:text-4xl font-semibold text-[#070A52] mb-14 tracking-wide">
        Best Sellers
      </h2>

      {/* Desktop */}
      <div className="hidden md:grid max-w-7xl mx-auto grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-stretch">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <ShimmerCard key={i} />)
          : bestSellers.map((item, i) => (
              <AnimatedCard key={i} delay={i * 120}>
                <BestSellerCard item={item} />
              </AnimatedCard>
            ))}
      </div>

      {/* Mobile Swipe */}
      <div className="md:hidden -mx-4 px-4">
        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-[220px] shrink-0">
                  <ShimmerCard />
                </div>
              ))
            : bestSellers.map((item, i) => (
                <div key={i} className="snap-start shrink-0 w-[220px]">
                  <BestSellerCard item={item} compact />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

/* ---------------- ANIMATION WRAPPER ---------------- */
const AnimatedCard = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setTimeout(() => setShow(true), delay);
        obs.disconnect();
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-700 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
};

/* ---------------- CARD ---------------- */
const BestSellerCard = ({ item, compact = false }) => {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/product/${item.productId}`)}
      className="group h-full bg-white rounded-2xl border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover brightness-95 group-hover:brightness-105 group-hover:scale-110 transition duration-500"
        />

        <span className="absolute top-3 left-3 bg-[#070A52] text-white text-xs px-3 py-1 rounded-full shadow-lg animate-pulse">
          {item.discount}% OFF
        </span>

        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
          <IconBtn onClick={(e) => e.stopPropagation()}>
            <ShoppingBag size={16} />
          </IconBtn>
          <IconBtn onClick={(e) => e.stopPropagation()}>
            <Heart size={16} />
          </IconBtn>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h4 className="text-xs font-bold uppercase text-gray-700">
          {item.brand}
        </h4>

        <p
          className={
            compact
              ? "text-xs text-gray-600 mt-1 line-clamp-2 min-h-[32px]"
              : "text-sm text-gray-600 mt-1 line-clamp-2 min-h-[40px]"
          }
        >
          {item.name}
        </p>

        <div className="mt-auto pt-3 flex items-center gap-2">
          <span className="font-semibold text-gray-900">
            ₹{formatINR(item.price)}
          </span>
          <span className="text-xs text-gray-400 line-through">
            ₹{formatINR(item.oldPrice)}
          </span>
        </div>
      </div>
    </article>
  );
};

/* ---------------- SHIMMER LOADER ---------------- */
const ShimmerCard = () => (
  <div className="relative overflow-hidden bg-white rounded-2xl border h-full flex flex-col">
    <div className="aspect-[3/4] bg-gray-200" />
    <div className="p-4 space-y-3 flex-1">
      <div className="h-3 w-1/2 bg-gray-200 rounded" />
      <div className="h-4 w-full bg-gray-200 rounded" />
      <div className="h-4 w-3/4 bg-gray-200 rounded" />
    </div>

    <div className="absolute inset-0 shimmer" />
    <style>{`
      .shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
        animation: shimmer 1.2s infinite;
      }
      @keyframes shimmer {
        from { transform: translateX(-100%); }
        to { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

/* ---------------- ICON BTN ---------------- */
const IconBtn = ({ children, onClick }) => (
  <button
    onClick={onClick}
    className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition"
  >
    {children}
  </button>
);

export default BestSellers;
