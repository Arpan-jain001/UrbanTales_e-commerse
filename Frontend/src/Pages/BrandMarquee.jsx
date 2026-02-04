import React, { useEffect, useMemo, useState } from "react";

/**
 * ✅ Upgraded BrandMarquee (same idea, much better UI)
 * - Premium gradient background + blur blobs
 * - Smooth infinite marquee
 * - Pause on hover
 * - Responsive logo sizing
 * - Click toast + open in new tab
 * - Subtle edge fade (pro look)
 */

const clothingBrands = [
  {
    name: "Nike",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwxWjbiOX8rYuq720FgrIefCPVC-y-gHSUYg&s",
    url: "https://www.nike.com",
  },
  {
    name: "Zara",
    logo: "https://logomakerr.ai/blog/wp-content/uploads/2022/08/2019-to-Present-Zara-logo-design.jpg",
    url: "https://www.zara.com",
  },
  {
    name: "Puma",
    logo: "https://upload.wikimedia.org/wikipedia/en/d/da/Puma_complete_logo.svg",
    url: "https://www.puma.com",
  },
  {
    name: "Adidas",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9h0lpUGrbfYgjqxOB-lqQyMbquztbOV0nVg&s",
    url: "https://www.adidas.com",
  },
  {
    name: "Levis",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUMRKrvSy9e5u3U1ODXaRNGfeSGzL43-igpA&s",
    url: "https://www.levis.com",
  },
  {
    name: "American Eagle",
    logo: "https://1000logos.net/wp-content/uploads/2020/05/Logo1-American-Eagle.jpg",
    url: "https://www.ae.com",
  },
  {
    name: "Gucci",
    logo: "https://wallpapers.com/images/hd/gucci-golden-logo-black-background-4425e92efifss0xb.png",
    url: "https://www.gucci.com",
  },
  {
    name: "Peter England",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVbfasNqhAXTW0YIr5M8fRMYCZZd98w7OsZA&s",
    url: "https://www.peterengland.com",
  },
  {
    name: "Burberry",
    logo: "https://i.pinimg.com/736x/88/ed/4b/88ed4b169f0a6661e09709850a2a86d0.jpg",
    url: "https://www.burberry.com",
  },
];

const BrandMarquee = () => {
  const [showToast, setShowToast] = useState(false);
  const [toastText, setToastText] = useState("");

  const items = useMemo(
    () => clothingBrands.concat(clothingBrands),
    []
  );

  const handleClick = (brand) => {
    setToastText(`🚀 Redirecting to ${brand.name}...`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
      window.open(brand.url, "_blank", "noopener,noreferrer");
    }, 900);
  };

  // auto hide toast safety
  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 1400);
    return () => clearTimeout(t);
  }, [showToast]);

  return (
    <section className="relative overflow-hidden bg-[#F9FAFB] px-4 py-14">
      {/* background blobs */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#070A52]/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto">
        {/* heading */}
        <div className="flex items-end justify-between gap-4 mb-7">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#070A52] tracking-wide">
              Top Brands
            </h2>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Trusted by shoppers — tap a brand to explore ✨
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live marquee
          </div>
        </div>

        {/* toast */}
        {showToast && (
          <div className="pointer-events-none fixed top-5 left-1/2 -translate-x-1/2 z-50">
            <div className="rounded-full bg-black/70 text-white px-4 py-2 text-sm shadow-lg backdrop-blur-md border border-white/10">
              {toastText}
            </div>
          </div>
        )}

        {/* marquee */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {items.map((brand, index) => (
              <button
                key={`${brand.name}-${index}`}
                type="button"
                onClick={() => handleClick(brand)}
                className="
                  brand-card group
                  flex items-center justify-center
                  rounded-2xl bg-white border border-gray-200
                  shadow-sm hover:shadow-lg
                  transition-all duration-300
                  focus:outline-none focus:ring-2 focus:ring-[#070A52]/25
                "
                aria-label={`Open ${brand.name}`}
                title={brand.name}
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="brand-logo-img"
                  loading="lazy"
                />
                <span className="brand-name">
                  {brand.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* container with edge fade */
        .marquee-wrap{
          position: relative;
          overflow: hidden;
          border-radius: 22px;
          padding: 14px 0;
          background: rgba(255,255,255,0.55);
          border: 1px solid rgba(17,24,39,0.08);
          box-shadow: 0 10px 25px rgba(0,0,0,0.06);
          backdrop-filter: blur(10px);
        }
        .marquee-wrap:before,
        .marquee-wrap:after{
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 70px;
          z-index: 5;
          pointer-events: none;
        }
        .marquee-wrap:before{
          left: 0;
          background: linear-gradient(to right, rgba(249,250,251,1), rgba(249,250,251,0));
        }
        .marquee-wrap:after{
          right: 0;
          background: linear-gradient(to left, rgba(249,250,251,1), rgba(249,250,251,0));
        }

        /* track */
        .marquee-track{
          display: flex;
          align-items: center;
          gap: 14px;
          width: max-content;
          padding: 0 14px;
          animation: marquee 22s linear infinite;
          will-change: transform;
        }
        .marquee-wrap:hover .marquee-track{
          animation-play-state: paused;
        }

        /* cards */
        .brand-card{
          position: relative;
          flex-shrink: 0;
          height: 84px;
          width: 190px;
          padding: 10px 14px;
        }
        .brand-card:hover{
          transform: translateY(-2px);
        }

        /* logo */
        .brand-logo-img{
          width: 100%;
          height: 100%;
          object-fit: contain;
          filter: saturate(1.05);
          transition: transform 300ms ease, filter 300ms ease;
        }
        .brand-card:hover .brand-logo-img{
          transform: scale(1.05);
          filter: saturate(1.12) contrast(1.05);
        }

        /* name tag */
        .brand-name{
          position: absolute;
          left: 50%;
          bottom: 8px;
          transform: translateX(-50%);
          font-size: 12px;
          font-weight: 600;
          color: rgba(17,24,39,0.85);
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(17,24,39,0.08);
          opacity: 0;
          transition: opacity 250ms ease, transform 250ms ease;
          pointer-events: none;
          white-space: nowrap;
        }
        .brand-card:hover .brand-name{
          opacity: 1;
          transform: translateX(-50%) translateY(-2px);
        }

        @keyframes marquee{
          from{ transform: translateX(0); }
          to{ transform: translateX(-50%); } /* because list is duplicated */
        }

        /* responsive */
        @media (max-width: 640px){
          .brand-card{ width: 150px; height: 74px; }
          .marquee-track{ animation-duration: 18s; }
          .marquee-wrap:before, .marquee-wrap:after{ width: 44px; }
        }

        @media (prefers-reduced-motion: reduce){
          .marquee-track{ animation: none; }
        }
      `}</style>
    </section>
  );
};

export default BrandMarquee;
