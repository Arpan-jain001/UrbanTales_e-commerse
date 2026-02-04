import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* -------------------- PRODUCTS -------------------- */
const products = [
  {
    title: "TheGiftKart Shockproof Crystal Clear Back Cover Case",
    heading: "Keep shopping for",
    mainImage:
      "https://www.exoticase.com/cdn/shop/files/KeepCool-Camera-Protect-MagSafe-iPhone-Case-Exoticase-For-iPhone-16-Pro-Max-Purple-5_800x.jpg?v=1727357376",
    price: 199,
    mrp: 999,
    productId: "69830a7ba2507edaf4c634b0",
    smallImages: [
      "https://www.exoticase.com/cdn/shop/files/KeepCool-Camera-Protect-MagSafe-iPhone-Case-Exoticase-For-iPhone-16-Pro-Max-Brown-9_800x.jpg?v=1727357396",
      "https://www.exoticase.com/cdn/shop/files/KeepCool-Camera-Protect-MagSafe-iPhone-Case-Exoticase-For-iPhone-16-Pro-Max-Pink-10_800x.jpg?v=1727357401",
      "https://www.exoticase.com/cdn/shop/files/KeepCool-Camera-Protect-MagSafe-iPhone-Case-Exoticase-For-iPhone-16-Pro-Max-Dark-Green-8_800x.jpg?v=1727357391",
    ],
  },
  {
    title: "YELONA Gorilla Grip Durable Kitchen Cutting Board Set of 3",
    heading: "Up to 60% off | Top kitchen essentials nearby",
    mainImage:
      "https://s.alicdn.com/@sc04/kf/A72985e53e4294e76ac33d971b3edef0f8.jpg_720x720q50.jpg",
    price: 749,
    mrp: 1999,
    productId: "69830b7ea2507edaf4c634db",
    smallImages: [
      "https://s.alicdn.com/@sc04/kf/Ha69f187a2fb949eb9a0eddd522bd8ba48.jpg_720x720q50.jpg",
      "https://s.alicdn.com/@sc04/kf/H3eddaab0557346c9942fc8805e662606M.jpg_720x720q50.jpg",
      "https://s.alicdn.com/@sc04/kf/Hb9d41cbe8ba34062a6518fac4f436742D.jpg_720x720q50.jpg",
    ],
  },
  {
    title: "eightone Women Floral Print Cotton Midi Dress",
    heading: "Up to 75% off | Casual ready from Small Businesses",
    mainImage:
      "https://i.pinimg.com/736x/ff/aa/2d/ffaa2d1e18872b06e95a4d8b393e6e3a.jpg",
    price: 670,
    mrp: 1999,
    productId: "69830bdca2507edaf4c634f4",
    smallImages: [
      "https://i.pinimg.com/736x/b6/52/1e/b6521e1258ab935cf5b4eb705f02610e.jpg",
      "https://i.pinimg.com/736x/ee/e8/8e/eee88e5ecfef1a0405edfecc4faa079a.jpg",
      "https://i.pinimg.com/736x/0f/f8/75/0ff875c7298e459964264782da3a0ff1.jpg",
    ],
  },
  {
    title: "YELONA Gorilla Grip Cutting Board (Alt Listing)",
    heading: "Pick up where you left off",
    mainImage:
      "https://m.media-amazon.com/images/I/611fDFAhGgL._AC_SY350_.jpg",
    price: 749,
    mrp: 1999,
    productId: "69830c40a2507edaf4c63503",
    smallImages: [
      "https://m.media-amazon.com/images/I/61eRCp5blLL._AC_SY110_.jpg",
      "https://m.media-amazon.com/images/I/71y2aqXqVHL._AC_SY110_.jpg",
    ],
  },
];

/* -------------------- MAIN -------------------- */
const ProductGrid = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-[#F9FAFB] py-16 px-4">
      {/* subtle particles */}
      <div className="absolute inset-0 -z-10 grid-particles" />

      <h2 className="text-3xl md:text-4xl font-semibold text-center text-[#070A52] mb-12 tracking-wide">
        Top Picks For You
      </h2>

      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-stretch">
        {products.map((product, index) => (
          <RevealCard key={index} delay={index * 80}>
            <ProductCard
              product={product}
              onClick={() => navigate(`/product/${product.productId}`)}
            />
          </RevealCard>
        ))}
      </div>

      <style>{`
        .grid-particles{
          background:
            radial-gradient(circle at 20% 30%, rgba(0,0,0,0.05) 2px, transparent 2px),
            radial-gradient(circle at 70% 60%, rgba(0,0,0,0.04) 2px, transparent 2px),
            radial-gradient(circle at 40% 80%, rgba(0,0,0,0.03) 2px, transparent 2px);
          background-size: 240px 240px;
          animation: floatParticles 28s linear infinite;
        }
        @keyframes floatParticles{
          from{ background-position: 0 0, 0 0, 0 0; }
          to{ background-position: 500px 500px, -500px 500px, 500px -500px; }
        }
      `}</style>
    </section>
  );
};

/* -------------------- SCROLL REVEAL WRAPPER -------------------- */
const RevealCard = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTimeout(() => setShow(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`h-full transition-all duration-700 ease-out ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
};

/* -------------------- CARD -------------------- */
const ProductCard = ({ product, onClick }) => {
  const discountPct =
    product?.mrp && product?.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null;

  return (
    <article
      onClick={onClick}
      className="
        group h-full cursor-pointer rounded-3xl
        border border-gray-200
        bg-white
        shadow-sm
        hover:shadow-xl
        hover:-translate-y-1
        transition-all duration-300
        flex flex-col overflow-hidden
      "
    >
      {/* Heading */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-[#070A52] line-clamp-2">
            {product.heading}
          </h3>

          {discountPct !== null && (
            <span className="shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#070A52] text-white">
              {discountPct}% OFF
            </span>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative mx-5 rounded-2xl bg-[#F2F4F8] aspect-[4/3] flex items-center justify-center overflow-hidden">
        <img
          src={product.mainImage}
          alt={product.title}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />

        {/* soft glow overlay */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none bg-gradient-to-tr from-white/0 via-white/0 to-white/30" />
      </div>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-sm text-gray-700 line-clamp-2 min-h-[40px] mb-4">
          {product.title}
        </p>

        {/* Thumbnails */}
        <div className="flex gap-2 mb-4">
          {product.smallImages.slice(0, 3).map((img, i) => (
            <div
              key={i}
              className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200 bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={img}
                alt="thumb"
                className="w-full h-full object-cover hover:scale-105 transition"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mt-auto flex items-end gap-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{product.price}
          </span>
          <span className="text-sm text-gray-400 line-through mb-[2px]">
            ₹{product.mrp}
          </span>
        </div>
      </div>
    </article>
  );
};

export default ProductGrid;
