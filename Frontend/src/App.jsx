import React, { useEffect } from "react"; // ✅
import './index.css'; // ✅
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom"; // ✅
import 'leaflet/dist/leaflet.css'; // ✅
import AdminPromotions from './admin/pages/AdminPromotions';
// ==== CONTEXT PROVIDERS ====
import ShopProvider from './context/ShopContext.jsx'; // Buyer/User context // ✅
import { SellerAuthProvider } from "./seller/context/SellerAuthContext.jsx"; // ✅
import { SellerDataProvider } from "./seller/context/SellerDataContext.jsx"; // ✅

// ==== USER/BUYER PAGES ====
import LandingPage from './Pages/LandingPage.jsx'; // ✅
import ContactUs from './Pages/ContactUs.jsx'; // ✅
import CartPage from './Pages/CartPage.jsx'; // ✅
import TrackOrder from './Pages/TrackOrder.jsx'; // ✅
import Productdetails from './Pages/Productdetails.jsx'; // ✅
import SellerOnBoarding from './Pages/SellerOnBoarding.jsx';// ✅
import SellerForm from './Pages/SellerForm.jsx';// ✅
import Dashboard from './Pages/Dashboard.jsx';// ✅
import SecureCheckout from './Pages/SecureCheckout.jsx';// ✅
import WelcomePage from './Pages/WelcomePage.jsx'; // ✅
import Login from './Pages/Login.jsx'; // ✅
import AboutUs from './Pages/AboutUs.jsx'; // ✅
import BrandMarquee from './Pages/BrandMarquee.jsx'; // ✅
import EditProfile from './Pages/editprofile.jsx'; // ✅
import ProfilePage from './Pages/profilepage.jsx'; // ✅
import AuthPage from './Pages/AuthPage.jsx'; // ✅
import HelpCenter from './Pages/HelpCenter.jsx'; // ✅
import Signup from './Pages/Signup.jsx'; // ✅
import Category from './Pages/Category.jsx'; // ✅
import OrderConfirmed from './Pages/OrderConfirmed.jsx'; // ✅
import Notifications from './Pages/Notifications.jsx'; // ✅
import ResetPasswordRequest from './Pages/ResetPasswordRequest.jsx'; // ✅
import ResetPasswordOTP from './Pages/ResetPasswordOTP.jsx'; // ✅
import ResetPasswordConfirm from './Pages/ResetPasswordConfirm.jsx'; // ✅
import Ai from './Components/Ai.jsx'; // ✅
import Search from "./Pages/Search.jsx";
import verifyAccount from "./Pages/verifyAccount.jsx"; // ✅

// ==== SELLER CONTEXT & PAGES ====
import SellerLogin from "./seller/pages/SellerLogin.jsx"; // ✅
import SellerSignup from "./seller/pages/SellerSignup.jsx"; // ✅
import SellerDashboard from "./seller/pages/SellerDashboard.jsx"; // ✅
import SellerProducts from "./seller/pages/SellerProducts.jsx"; // ✅
import SellerAddProduct from "./seller/pages/SellerAddProduct.jsx"; // ✅
import SellerEditProduct from "./seller/pages/SellerEditProduct.jsx"; // ✅
import SellerOrders from "./seller/pages/SellerOrders.jsx"; // ✅
import SellerOrderDetails from "./seller/pages/SellerOrderDetails.jsx"; // ✅
import SellerEarnings from "./seller/pages/SellerEarnings.jsx"; // ✅
import SellerProfile from "./seller/pages/SellerProfile.jsx"; // ✅
import SellerCategory from "./seller/pages/SellerCategory.jsx"; // ✅
import SellerOnboarding from "./seller/pages/SellerOnboarding.jsx"; // ✅
import SellerOrderStatusTracker from "./seller/components/SellerOrderStatusTracker.jsx"; // ✅ 
import SellerOrderManager from "./seller/pages/SellerOrderManager.jsx"; // ✅
import SingleProduct from './Pages/SingleProduct'; // ✅
import SellerResetPasswordOTP from "./seller/pages/SellerResetPasswordOTP.jsx"; // ✅
import SellerResetPasswordConfirm from "./seller/pages/SellerResetPasswordConfirm.jsx"; // ✅
import SellerVerifyOtp from "./seller/pages/SellerVerifyOtp.jsx"; // ✅
import UnderConstruction from './Pages/UnderConstruction'; // ✅
import SellerNotifications from "./seller/pages/SellerNotifications";

// ==== ALL ADMIN PAGES ====

import { AdminAuthProvider } from "./admin/context/AdminAuthContext.jsx"; // ✅ MISSING
import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute.jsx"; // ✅ MISSING
import AdminLayout from "./admin/layout/AdminLayout.jsx"; // ✅ MISSING
import AdminLogin from "./admin/pages/AdminLogin.jsx";
import AdminDashboard from "./admin/pages/AdminDashboard.jsx";
import AdminProducts from "./admin/pages/AdminProducts.jsx";
import AdminUsers from "./admin/pages/AdminUsers.jsx";
import AdminSellers from "./admin/pages/AdminSellers.jsx";
import AdminOrders from "./admin/pages/AdminOrders.jsx";
import AdminManage from "./admin/pages/AdminManage.jsx";
import AdminProfile from "./admin/pages/AdminProfile.jsx";
import AdminForgotPassword from "./admin/pages/AdminForgotPassword.jsx";
import AdminVerifyOtp from "./admin/pages/AdminVerifyOtp.jsx";
import AdminResetPassword from "./admin/pages/AdminResetPassword.jsx";
import AdminNotifications from "./admin/pages/AdminNotifications";



// ==== UTILS ====
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  return (
    <ShopProvider>
      <SellerAuthProvider>
        <SellerDataProvider>
          <BrowserRouter>
            <ScrollToTop />
            <AdminAuthProvider>
              <Routes>
                {/* USER/BUYER ROUTES */} // ✅
                <Route path="/" element={<LandingPage />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/cartpage" element={<CartPage />} />
                <Route path="/trackorder" element={<TrackOrder />} />
                <Route path="/productdetails" element={<Productdetails />} />
                <Route path="/seller-onboarding" element={<SellerOnBoarding />} />
                <Route path="/sellerform" element={<SellerForm />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/checkout" element={<SecureCheckout />} />
                <Route path="/welcomepage" element={<WelcomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/marque" element={<BrandMarquee />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/editprofile" element={<EditProfile />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/helpcenter" element={<HelpCenter />} />
                <Route path="/register" element={<Signup />} />
                <Route path="/category" element={<Category />} />
                <Route path="/orderconfirmed" element={<OrderConfirmed />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/reset-password" element={<ResetPasswordRequest />} />
                <Route path="/reset-password/otp" element={<ResetPasswordOTP />} />
                <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
                <Route path="/under-construction" element={<UnderConstruction />} />
                <Route path="/product/:id" element={<SingleProduct />} />
                <Route path="/search" element={<Search />} />
                <Route path="/verify-account" element={<verifyAccount />} />

                {/* SELLER ROUTES */}
                <Route path="/sellerlogin" element={<SellerLogin />} />
                <Route path="/seller/signup" element={<SellerSignup />} />
                <Route path="/seller/dashboard" element={<SellerDashboard />} />
                <Route path="/seller/products" element={<SellerProducts />} />
                <Route path="/seller/add-product" element={<SellerAddProduct />} />
                <Route path="/seller/edit-product/:id" element={<SellerEditProduct />} />
                <Route path="/seller/orders" element={<SellerOrders />} />
                <Route path="/seller/orders/:id" element={<SellerOrderDetails />} />
                <Route path="/seller/earnings" element={<SellerEarnings />} />
                <Route path="/seller/profile" element={<SellerProfile />} />
                <Route path="/seller/category/:category" element={<SellerCategory />} />
                <Route path="/seller/onboarding" element={<SellerOnboarding />} />
                <Route path="/seller/order-tracker/:id" element={<SellerOrderStatusTracker />} />
                <Route path="/seller/orders/manage" element={<SellerOrderManager />} />
                <Route path="/seller/forgot-password" element={<SellerResetPasswordOTP />} />
                <Route path="/seller/reset-password" element={<SellerResetPasswordConfirm />} />
                <Route path="/seller/verify-otp" element={<SellerVerifyOtp />} />
                <Route path="/seller/notifications" element={<SellerNotifications />} />
                
                {/* ADMIN PUBLIC */}
                <Route path="/admin/promotions" element={<AdminPromotions />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                <Route path="/admin/verify-otp" element={<AdminVerifyOtp />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                
                {/* ADMIN PROTECTED */}
                <Route element={<AdminProtectedRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/products" element={<AdminProducts />} />
                    <Route path="/admin/users" element={<AdminUsers />} />
                    <Route path="/admin/sellers" element={<AdminSellers />} />
                    <Route path="/admin/orders" element={<AdminOrders />} />
                    <Route path="/admin/notifications" element={<AdminNotifications />} />
                    <Route path="/admin/profile" element={<AdminProfile />} />
                    <Route path="/admin/manage-admins" element={<AdminManage />} />
                  </Route>
                </Route>
              </Routes>
            </AdminAuthProvider>
            <Ai />
          </BrowserRouter>
        </SellerDataProvider>
      </SellerAuthProvider>
    </ShopProvider>
  );
}

export default App;
