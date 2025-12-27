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
import { HashLoader } from "react-spinners"; 
import BrandMarquee from "./BrandMarquee";
import bannerImage from "../assets/coupon.png";

function LandingPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
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
      <NewYearPromotion /> {/* ← ADD THIS LINE */}
      <Navbar />
      <HeroBanner />
      <CategoryCircles />
      <BestSellers />
      <div className="w-full">
        <img 
          src={bannerImage} 
          alt="Discount Banner" 
          className="w-full object-cover"
        />
      </div>
      <ProductGrid />
      <BrandMarquee />
      <PromoGrid />
      <HappyCustomers />
      <TrendingProducts />
      <CustomerReviews />
      <Footer />
    </div>
  );
}

export default LandingPage;
