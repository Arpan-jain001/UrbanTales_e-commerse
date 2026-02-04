import React, { useEffect, useState } from "react";
import NewYearPromotion from "../Components/NewYearPromotion";
import Navbar from "../Components/Navbar";
import HeroBanner from "../Components/HeroBanner";
import CategoryCircles from "../Components/CategoryCircles";
import BestSellers from "../Components/BestSeller";
import ProductGrid from "../Components/ProductGrid";
import PromoGrid from "../Components/PromoGrid";
import HappyCustomers from "../Components/HappyCustomers";
import TrendingProducts from "../Components/TrendingProducts";
import CustomerReviews from "../Components/CustomerReviews";
import Footer from "../Components/Footer";
import BrandMarquee from "./BrandMarquee";
import bannerImage from "../assets/coupon.png";
import { HashLoader } from "react-spinners";

const LANDING_LOADER_KEY = "urbantales_landing_loaded_v1";

function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = sessionStorage.getItem(LANDING_LOADER_KEY);
    if (loaded) {
      setLoading(false);
      return;
    }

    const t = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem(LANDING_LOADER_KEY, "1");
    }, 1600);

    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <div className="bg-gray-100">
      <NewYearPromotion />
      <Navbar />
      <HeroBanner />
      <CategoryCircles />
      <BestSellers />

      {/* 🔥 COUPON BANNER (IMAGE + CHIPS ONLY) */}
      <div className="w-full px-3 sm:px-6 lg:px-8 mt-2">
        <div className="max-w-7xl mx-auto">
          <div
            className="
              coupon-wrap relative overflow-hidden rounded-2xl
              bg-white border border-gray-200
              shadow-sm transition
            "
          >
            {/* soft glow */}
            <div className="absolute -top-20 -left-20 h-52 w-52 bg-[#070A52]/10 blur-3xl" />
            <div className="absolute -bottom-20 -right-20 h-52 w-52 bg-black/10 blur-3xl" />

            {/* banner image */}
            <img
              src={bannerImage}
              alt="Offer Banner"
              className="coupon-img w-full object-cover max-h-[420px]"
              loading="lazy"
            />

            {/* dark blinking chips */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <span className="deal-chip hidden sm:inline-flex">New</span>
              <span className="deal-chip delay">Hot Deals</span>
            </div>
          </div>
        </div>
      </div>

      {/* बाकी सब same */}
      <ProductGrid />
      <BrandMarquee />
      <PromoGrid />
      <HappyCustomers />
      <TrendingProducts />
      <CustomerReviews />
      <Footer />

      {/* 🔥 Local styles */}
      <style>{`
        .coupon-wrap{
          transition: box-shadow 300ms ease, transform 300ms ease, border-color 300ms ease;
        }
        .coupon-wrap:hover{
          box-shadow: 0 18px 55px rgba(0,0,0,0.18);
          transform: translateY(-2px);
          border-color: rgba(7,10,82,0.25);
        }

        .coupon-img{
          transition: transform 600ms ease;
        }
        .coupon-wrap:hover .coupon-img{
          transform: scale(1.02);
        }

        .deal-chip{
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 800;
          border-radius: 999px;
          color: #fff;
          background: linear-gradient(135deg, #0b0f1a, #1a1f2e);
          border: 1px solid rgba(255,255,255,0.15);
          animation: darkBlink 1.8s ease-in-out infinite;
          transition: transform 250ms ease, box-shadow 250ms ease;
        }

        .deal-chip.delay{
          animation-delay: .6s;
        }

        .deal-chip:hover{
          transform: translateY(-1px) scale(1.06);
          box-shadow:
            0 10px 22px rgba(0,0,0,.35),
            0 0 22px rgba(110,180,255,.22);
        }

        @keyframes darkBlink{
          0%,100%{ opacity: 1; transform: scale(1); }
          50%{ opacity: .7; transform: scale(1.05); }
        }

        @media (prefers-reduced-motion: reduce){
          .deal-chip{ animation: none; }
          .coupon-img{ transition: none; }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
