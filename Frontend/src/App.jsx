import React, { useEffect } from "react";
import "./index.css";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";

import ShopProvider from "./context/ShopContext.jsx";
import { SellerAuthProvider } from "./seller/context/SellerAuthContext.jsx";
import { SellerDataProvider } from "./seller/context/SellerDataContext.jsx";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext.jsx";

import LandingPage from "./Pages/LandingPage.jsx";
import ContactUs from "./Pages/ContactUs.jsx";
import CartPage from "./Pages/CartPage.jsx";
import TrackOrder from "./Pages/TrackOrder.jsx";
import Productdetails from "./Pages/Productdetails.jsx";
import SellerOnBoarding from "./Pages/SellerOnBoarding.jsx";
import SellerForm from "./Pages/SellerForm.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import SecureCheckout from "./Pages/SecureCheckout.jsx";
import WelcomePage from "./Pages/WelcomePage.jsx";
import Login from "./Pages/Login.jsx";
import AboutUs from "./Pages/AboutUs.jsx";
import BrandMarquee from "./Pages/BrandMarquee.jsx";
import EditProfile from "./Pages/editprofile.jsx";
import ProfilePage from "./Pages/profilepage.jsx";
import AuthPage from "./Pages/AuthPage.jsx";
import HelpCenter from "./Pages/HelpCenter.jsx";
import Signup from "./Pages/Signup.jsx";
import Category from "./Pages/Category.jsx";
import OrderConfirmed from "./Pages/OrderConfirmed.jsx";
import Notifications from "./Pages/Notifications.jsx";
import Wishlist from "./Pages/Wishlist.jsx";
import ResetPasswordRequest from "./Pages/ResetPasswordRequest.jsx";
import ResetPasswordOTP from "./Pages/ResetPasswordOTP.jsx";
import ResetPasswordConfirm from "./Pages/ResetPasswordConfirm.jsx";
import Search from "./Pages/Search.jsx";
import VerifyAccount from "./Pages/VerifyAccount.jsx";
import SingleProduct from "./Pages/SingleProduct.jsx";
import UnderConstruction from "./Pages/UnderConstruction.jsx";
import Ai from "./Components/Ai.jsx";

import SellerLogin from "./seller/pages/SellerLogin.jsx";
import SellerSignup from "./seller/pages/SellerSignup.jsx";
import SellerVerifyAccount from "./seller/pages/SellerVerifyAccount.jsx";
import SellerDashboard from "./seller/pages/SellerDashboard.jsx";
import SellerProducts from "./seller/pages/SellerProducts.jsx";
import SellerAddProduct from "./seller/pages/SellerAddProduct.jsx";
import SellerEditProduct from "./seller/pages/SellerEditProduct.jsx";
import SellerOrders from "./seller/pages/SellerOrders.jsx";
import SellerOrderDetails from "./seller/pages/SellerOrderDetails.jsx";
import SellerEarnings from "./seller/pages/SellerEarnings.jsx";
import SellerProfile from "./seller/pages/SellerProfile.jsx";
import SellerCategory from "./seller/pages/SellerCategory.jsx";
import SellerOnboarding from "./seller/pages/SellerOnboarding.jsx";
import SellerOrderStatusTracker from "./seller/components/SellerOrderStatusTracker.jsx";
import SellerOrderManager from "./seller/pages/SellerOrderManager.jsx";
import SellerResetPasswordOTP from "./seller/pages/SellerResetPasswordOTP.jsx";
import SellerResetPasswordConfirm from "./seller/pages/SellerResetPasswordConfirm.jsx";
import SellerVerifyOtp from "./seller/pages/SellerVerifyOtp.jsx";
import SellerNotifications from "./seller/pages/SellerNotifications.jsx";
import SellerStockRequests from "./seller/pages/SellerStockRequests.jsx";
import SellerProtectedRoute from "./seller/components/SellerProtectedRoute.jsx";

import AdminProtectedRoute from "./admin/routes/AdminProtectedRoute.jsx";
import AdminLayout from "./admin/layout/AdminLayout.jsx";
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
import AdminNotifications from "./admin/pages/AdminNotifications.jsx";
import AdminPromotions from "./admin/pages/AdminPromotions.jsx";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
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
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/reset-password" element={<ResetPasswordRequest />} />
                <Route path="/reset-password/otp" element={<ResetPasswordOTP />} />
                <Route path="/reset-password/confirm" element={<ResetPasswordConfirm />} />
                <Route path="/under-construction" element={<UnderConstruction />} />
                <Route path="/product/:id" element={<SingleProduct />} />
                <Route path="/search" element={<Search />} />
                <Route path="/verify-account" element={<VerifyAccount />} />

                <Route path="/sellerlogin" element={<SellerLogin />} />
                <Route path="/seller/signup" element={<SellerSignup />} />
                <Route path="/seller/verify-account" element={<SellerVerifyAccount />} />
                <Route path="/seller/forgot-password" element={<SellerResetPasswordOTP />} />
                <Route path="/seller/reset-password" element={<SellerResetPasswordConfirm />} />
                <Route path="/seller/verify-otp" element={<SellerVerifyOtp />} />
                <Route element={<SellerProtectedRoute />}>
                  <Route path="/seller/dashboard" element={<SellerDashboard />} />
                  <Route path="/seller/products" element={<SellerProducts />} />
                  <Route path="/seller/add-product" element={<SellerAddProduct />} />
                  <Route path="/seller/edit-product/:id" element={<SellerEditProduct />} />
                  <Route path="/seller/orders" element={<SellerOrders />} />
                  <Route path="/seller/orders/:id" element={<SellerOrderDetails />} />
                  <Route path="/seller/earnings" element={<SellerEarnings />} />
                  <Route path="/seller/stock-requests" element={<SellerStockRequests />} />
                  <Route path="/seller/profile" element={<SellerProfile />} />
                  <Route path="/seller/category/:category" element={<SellerCategory />} />
                  <Route path="/seller/onboarding" element={<SellerOnboarding />} />
                  <Route path="/seller/order-tracker/:id" element={<SellerOrderStatusTracker />} />
                  <Route path="/seller/orders/manage" element={<SellerOrderManager />} />
                  <Route path="/seller/notifications" element={<SellerNotifications />} />
                </Route>

                <Route path="/admin/promotions" element={<AdminPromotions />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                <Route path="/admin/verify-otp" element={<AdminVerifyOtp />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />
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
