import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";

const deliveryCharge = 50;
const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// Valid UPI VPA handles
const VALID_UPI_HANDLES = [
  '@ybl',      // PhonePe
  '@paytm',    // Paytm
  '@pthdfc',   // PayTM HDFC
  '@ibl',      // ICICI Bank
  '@axl',      // Axis Bank
  '@sbi',      // State Bank of India
  '@oksbi',    // SBI
  '@okaxis',   // Axis Bank
  '@okicici',  // ICICI Bank
  '@okhdfcbank', // HDFC Bank
  '@hdfcbank', // HDFC Bank
  '@upi',      // Generic UPI
  '@gpay',     // Google Pay
  '@apl',      // Amazon Pay
  '@fbl',      // Federal Bank
  '@yapl',     // YES Bank
  '@ikwik',    // IDFC Bank
  '@jupiteraxis', // Jupiter
  '@pockets',  // Pockets by ICICI
];

export default function SecureCheckout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [upiId, setUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [upiError, setUpiError] = useState('');
  const [instructions, setInstructions] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    state: ""
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }
    fetch(`${BASE_API_URL}/api/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch cart");
        return res.json();
      })
      .then((data) => {
        setSubtotal(data.subtotal || 0);
        setCartItemCount(data.items?.length || 0);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        alert("Failed to load cart. Please try again.");
      });
    
    const saved = JSON.parse(localStorage.getItem('checkoutUserInfo'));
    if (saved) setUserInfo(saved);
  }, [token, navigate]);

  useEffect(() => {
    localStorage.setItem('checkoutUserInfo', JSON.stringify(userInfo));
  }, [userInfo]);

  // UPI ID Validation Function
  const validateUpiId = (upiString) => {
    const trimmedUpi = upiString.trim();
    
    // Basic format check: should contain exactly one @
    if (!trimmedUpi.includes('@') || trimmedUpi.split('@').length !== 2) {
      return { valid: false, error: "UPI ID must contain @ symbol (e.g., username@ybl)" };
    }

    const [username, handle] = trimmedUpi.split('@');

    // Check username part (before @)
    if (username.length < 3) {
      return { valid: false, error: "Username before @ must be at least 3 characters" };
    }

    // Check if username contains only valid characters (alphanumeric, dots, underscores, hyphens)
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      return { valid: false, error: "Username can only contain letters, numbers, dots, underscores, and hyphens" };
    }

    // Check if handle is valid
    const handleWithAt = '@' + handle.toLowerCase();
    if (!VALID_UPI_HANDLES.includes(handleWithAt)) {
      return { 
        valid: false, 
        error: `Invalid UPI handle. Use valid handles like @ybl, @paytm, @ibl, @sbi, @gpay, etc.` 
      };
    }

    return { valid: true, error: "" };
  };

  const handleUpiVerification = () => {
    const validation = validateUpiId(upiId);
    
    if (validation.valid) {
      setIsUpiVerified(true);
      setUpiError('');
      alert("✅ UPI ID verified successfully!");
    } else {
      setIsUpiVerified(false);
      setUpiError(validation.error);
      alert("❌ " + validation.error);
    }
  };

  const clearUserCart = async () => {
    try {
      await fetch(`${BASE_API_URL}/api/cart/clear`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const saveOrderToDB = async (paymentStatus) => {
    if (cartItemCount === 0) {
      alert("Your cart is empty. Add products before checkout.");
      throw new Error("Empty cart");
    }

    const discountedTotal = subtotal + deliveryCharge - discount;
    const orderPayload = {
      name: userInfo.name,
      mobile: userInfo.mobile,
      address: `${userInfo.address}, ${userInfo.city}, ${userInfo.state} - ${userInfo.pincode}`,
      instructions,
      paymentMethod: selectedPayment,
      paymentStatus,
      totalAmount: discountedTotal.toFixed(2),
    };

    try {
      const res = await fetch(`${BASE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to save order: " + (errorData.message || "Unknown error"));
        throw new Error(errorData.message || "Order save failed");
      }
      await res.json();
    } catch (err) {
      throw err;
    }
  };

  const handlePaymentSuccess = async (status) => {
    try {
      await saveOrderToDB(status);
      await clearUserCart();
      saveOrderDetailsAndNavigate(status);
    } catch (err) {
      console.error("Payment success handling error:", err);
    }
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();

    if (code === "URBANTALES" || code === "AJ001") {
      if (appliedCoupon === code) {
        alert("😄 Hey, you already used this coupon! Trying hard, aren't you?");
      } else {
        setDiscount((subtotal + deliveryCharge) * 0.2);
        setAppliedCoupon(code);
        alert("✅ Coupon Applied: 20% discount");
      }
    } else {
      setDiscount(0);
      alert("❌ Invalid Coupon");
      setAppliedCoupon(null);
    }
  };

  const isAddressComplete =
    userInfo.name &&
    userInfo.mobile &&
    userInfo.address &&
    userInfo.city &&
    userInfo.pincode &&
    userInfo.state;

  const isPayButtonEnabled =
    selectedPayment &&
    (selectedPayment !== "upi" || (upiId.trim() && isUpiVerified)) &&
    isAddressComplete &&
    !isEditingAddress;

  const discountedTotal = subtotal + deliveryCharge - discount;

  const saveOrderDetailsAndNavigate = (paymentStatus) => {
    const orderDetails = {
      orderId: `ORD-${Date.now()}`,
      name: userInfo.name,
      mobile: userInfo.mobile,
      address: `${userInfo.address}, ${userInfo.city}, ${userInfo.state} - ${userInfo.pincode}`,
      totalAmount: discountedTotal.toFixed(2),
      paymentMethod: selectedPayment,
      paymentStatus,
      instructions,
      orderDate: new Date().toLocaleString(),
    };
    localStorage.setItem("lastPlacedOrder", JSON.stringify(orderDetails));
    navigate("/orderconfirmed");
  };

  const handleRazorpayPayment = async () => {
    if (!isAddressComplete) {
      alert("Please fill in all address details before proceeding with payment.");
      setIsEditingAddress(true);
      return;
    }

    // COD
    if (selectedPayment === "cod") {
      alert("✅ Cash on Delivery selected! Your order will be confirmed.");
      await handlePaymentSuccess("Pending");
      return;
    }

    try {
      const totalAmountInPaise = Math.round(discountedTotal * 100);
      const res = await fetch(`${BASE_API_URL}/api/razorpay/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmountInPaise }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || res.statusText);
      }
      
      const orderData = await res.json();
      
      const options = {
        key: "rzp_test_QMG1XV6hszJZlA",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "UrbanTales",
        description: "Order Payment",
        order_id: orderData.id,
        handler: async (response) => {
          alert("✅ Payment successful! Your order has been placed.");
          await handlePaymentSuccess("Successful");
        },
        prefill: {
          name: userInfo.name,
          email: "customer@example.com",
          contact: userInfo.mobile,
          ...(selectedPayment === "upi" && isUpiVerified && upiId.trim() && {
            method: "upi",
            "vpa": upiId.trim() // Auto-fill UPI ID in Razorpay
          })
        },
        method: {
          netbanking: selectedPayment === "netbanking",
          card: selectedPayment === "card",
          upi: selectedPayment === "upi",
          wallet: false,
        },
        theme: { color: "#070A52" },
        image: "https://seeklogo.com/images/R/razorpay-logo-B4B31B7918-seeklogo.com.png",
        modal: {
          ondismiss: function() {
            alert("⚠️ Payment cancelled. Please try again.");
          }
        }
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment error: " + (err.message || "Please retry!"));
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <HashLoader color="#070A52" size={80} />
      </div>
    );

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
          <p className="text-red-600 text-xl mb-4">Please login to continue checkout</p>
          <button 
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white rounded-xl hover:shadow-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 text-gray-800 min-h-screen flex flex-col justify-between">
        <Navbar />
        <div className="flex-grow">
          <header className="bg-white flex justify-between items-center px-6 py-4 shadow-lg">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              🔒 Secure Checkout
            </div>
            <div className="text-2xl">🛒</div>
          </header>
          <main className="max-w-6xl mx-auto p-4 grid md:grid-cols-3 gap-4">
            <section className="md:col-span-2 space-y-4">
              {/* Address Section */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-start">
                  <div className="w-full">
                    <h2 className="font-bold text-xl text-[#070A52] mb-4 flex items-center gap-2">
                      <span>📍</span>
                      Delivery Address
                    </h2>
                    {isEditingAddress ? (
                      <div className="space-y-3 text-sm">
                        {[
                          ["Full Name", "name", "text"],
                          ["Mobile Number", "mobile", "tel"],
                          ["Address (House No., Building, Street, Area)", "address", "text"],
                          ["City", "city", "text"],
                          ["Pincode", "pincode", "text"],
                          ["State", "state", "text"],
                        ].map(([label, field, type]) => (
                          <div key={field}>
                            <label className="block text-gray-700 font-medium mb-1">{label}</label>
                            <input
                              type={type}
                              placeholder={label}
                              className="w-full border-2 border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                              value={userInfo[field]}
                              onChange={(e) => setUserInfo({ ...userInfo, [field]: e.target.value })}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm leading-relaxed bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl">
                        {isAddressComplete ? (
                          <>
                            <p className="font-bold text-gray-800 text-base mb-1">
                              {userInfo.name} <span className="text-purple-600">({userInfo.mobile})</span>
                            </p>
                            <p className="text-gray-600">{userInfo.address}</p>
                            <p className="text-gray-600">
                              {userInfo.city}, {userInfo.state} - <span className="font-semibold">{userInfo.pincode}</span>
                            </p>
                          </>
                        ) : (
                          <p className="text-red-500 flex items-center gap-2">
                            <span>⚠️</span>
                            Please add your delivery address details to proceed.
                          </p>
                        )}
                      </div>
                    )}
                    <textarea
                      className="w-full mt-3 border-2 border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                      placeholder="🚚 Delivery instructions (Optional - e.g., Leave at door, Call before delivery)"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      rows="2"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (isEditingAddress) {
                        if (isAddressComplete) {
                          setIsEditingAddress(false);
                          alert("✅ Address saved successfully!");
                        } else {
                          alert("⚠️ Please fill in all required fields before saving.");
                        }
                      } else setIsEditingAddress(true);
                    }}
                    className="text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-4 py-2 rounded-lg ml-4 whitespace-nowrap transition shadow-md hover:shadow-lg"
                  >
                    {isEditingAddress ? "💾 Save" : "✏️ Edit"}
                  </button>
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="font-bold text-xl text-[#070A52] mb-4 flex items-center gap-2">
                  <span>💳</span>
                  Payment Method
                </h2>
                
                {/* Coupon Section */}
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                  <label htmlFor="couponInput" className="font-bold text-[#070A52] mb-2 flex items-center gap-2">
                    <span>🎫</span>
                    Apply Coupon Code
                  </label>
                  <div className="flex mt-2 space-x-2">
                    <input
                      id="couponInput"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="border-2 border-gray-300 rounded-xl px-4 py-2 w-1/2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 font-medium transition"
                      placeholder="e.g., URBANTALES"
                    />
                    <button
                      onClick={applyCoupon}
                      disabled={couponCode.trim() === ""}
                      className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                        couponCode.trim() !== ""
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white cursor-pointer shadow-md hover:shadow-lg"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      Apply
                    </button>
                    {appliedCoupon && (
                      <button
                        onClick={() => {
                          setCouponCode("");
                          setDiscount(0);
                          setAppliedCoupon(null);
                          alert("🗑️ Coupon removed");
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer transition shadow-md hover:shadow-lg"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-green-600 text-sm mt-2 font-semibold">
                      ✅ Coupon "{appliedCoupon}" applied! You saved ₹{discount.toFixed(2)}
                    </p>
                  )}
                </div>

                <fieldset className="border-2 border-gray-300 rounded-xl p-5 space-y-4">
                  <legend className="font-bold text-[#070A52] px-3 text-lg">Select Payment Option</legend>
                  
                  {/* Card via Razorpay */}
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-purple-50 transition border-2 border-transparent hover:border-purple-200">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={selectedPayment === "card"}
                      onChange={() => setSelectedPayment("card")}
                      className="form-radio h-5 w-5 text-[#070A52]"
                    />
                    <span className="flex items-center space-x-3">
                      <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyHdEg7zNW7pe7MrW4qN9qBSH29HBRQuOfnA&s"
                        className="h-6 w-6"
                        alt="razorpay"
                      />
                      <span className="font-semibold">💳 Credit/Debit Card via Razorpay</span>
                    </span>
                  </label>

                  {/* Net Banking + Bank Select */}
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-purple-50 transition border-2 border-transparent hover:border-purple-200">
                    <input
                      type="radio"
                      name="payment"
                      value="netbanking"
                      checked={selectedPayment === "netbanking"}
                      onChange={() => setSelectedPayment("netbanking")}
                      className="form-radio h-5 w-5 text-[#070A52]"
                    />
                    <span className="font-semibold">🏦 Net Banking</span>
                  </label>
                  {selectedPayment === "netbanking" && (
                    <select className="mt-2 ml-8 border-2 border-gray-300 rounded-xl px-4 py-2 w-2/3 sm:w-1/2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition font-medium">
                      <option value="">Choose your bank</option>
                      <option value="sbi">State Bank of India</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="yes">YES Bank</option>
                    </select>
                  )}

                  {/* UPI Apps */}
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-purple-50 transition border-2 border-transparent hover:border-purple-200">
                    <input
                      type="radio"
                      name="payment"
                      value="upi"
                      checked={selectedPayment === "upi"}
                      onChange={() => {
                        setSelectedPayment("upi");
                        setIsUpiVerified(false);
                        setUpiError('');
                      }}
                      className="form-radio h-5 w-5 text-[#070A52]"
                    />
                    <span className="font-semibold">📱 UPI (PhonePe, Google Pay, Paytm, etc.)</span>
                  </label>
                  {selectedPayment === "upi" && (
                    <div className="ml-8 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            setIsUpiVerified(false);
                            setUpiError('');
                          }}
                          placeholder="username@ybl (PhonePe) or username@paytm"
                          className={`border-2 rounded-xl px-4 py-2 text-sm flex-grow transition focus:ring-2 ${
                            upiError 
                              ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
                              : "border-gray-300 focus:ring-purple-500 focus:border-purple-500"
                          }`}
                        />
                        <button
                          type="button"
                          disabled={!upiId.trim() || isUpiVerified}
                          onClick={handleUpiVerification}
                          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                            upiId.trim() && !isUpiVerified
                              ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white cursor-pointer shadow-md hover:shadow-lg"
                              : "bg-gray-300 text-gray-600 cursor-not-allowed"
                          }`}
                        >
                          Verify
                        </button>
                      </div>
                      {isUpiVerified && (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-semibold bg-green-50 p-2 rounded-lg">
                          <span>✅</span>
                          <span>UPI ID Verified! Will be auto-filled in payment</span>
                        </div>
                      )}
                      {upiError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm font-semibold bg-red-50 p-2 rounded-lg">
                          <span>❌</span>
                          <span>{upiError}</span>
                        </div>
                      )}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-xs text-gray-700 font-medium mb-1">💡 Valid UPI handles:</p>
                        <p className="text-xs text-gray-600">
                          @ybl (PhonePe), @paytm (Paytm), @gpay (Google Pay), @ibl (ICICI), @sbi (SBI), @axl (Axis), @hdfcbank (HDFC), @upi
                        </p>
                      </div>
                    </div>
                  )}

                  {/* COD */}
                  <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl hover:bg-purple-50 transition border-2 border-transparent hover:border-purple-200">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={selectedPayment === "cod"}
                      onChange={() => setSelectedPayment("cod")}
                      className="form-radio h-5 w-5 text-[#070A52]"
                    />
                    <span className="font-semibold">💵 Cash on Delivery / Pay on Delivery</span>
                  </label>
                </fieldset>
              </div>
            </section>

            {/* Order Summary Sidebar */}
            <aside className="bg-white p-6 rounded-2xl shadow-lg h-fit sticky top-4 border border-gray-100">
              <button
                className={`w-full py-3 rounded-xl text-base font-bold mb-6 transition-all duration-200 shadow-md ${
                  isPayButtonEnabled
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-[#070A52] cursor-pointer hover:shadow-xl transform hover:scale-105"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
                disabled={!isPayButtonEnabled}
                onClick={handleRazorpayPayment}
              >
                {isPayButtonEnabled ? `🔒 Pay ₹${discountedTotal.toFixed(2)}` : "⚠️ Complete Details"}
              </button>
              
              <h3 className="font-bold text-[#070A52] mb-4 border-b-2 pb-3 text-lg">
                📋 Order Summary
              </h3>
              
              <ul className="text-sm space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Items ({cartItemCount}):</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Charges:</span>
                  <span className="font-semibold">₹{deliveryCharge.toFixed(2)}</span>
                </li>
                {discount > 0 && (
                  <li className="flex justify-between items-center text-green-600">
                    <span className="font-medium">🎉 Promotion Applied:</span>
                    <span className="font-bold">- ₹{discount.toFixed(2)}</span>
                  </li>
                )}
                <hr className="my-3 border-gray-300" />
                <li className="flex justify-between items-center font-bold text-lg mt-3 bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-xl">
                  <span className="text-[#070A52]">Order Total:</span>
                  <span className="text-purple-600">₹{discountedTotal.toFixed(2)}</span>
                </li>
              </ul>

              {/* Payment Method Display */}
              {selectedPayment && (
                <div className="mt-4 bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <p className="text-xs text-gray-600 font-medium mb-1">Selected Payment:</p>
                  <p className="text-sm font-bold text-[#070A52]">
                    {selectedPayment === "card" && "💳 Credit/Debit Card"}
                    {selectedPayment === "netbanking" && "🏦 Net Banking"}
                    {selectedPayment === "upi" && "📱 UPI"}
                    {selectedPayment === "cod" && "💵 Cash on Delivery"}
                  </p>
                  {selectedPayment === "upi" && isUpiVerified && (
                    <p className="text-xs text-green-600 mt-1">✅ {upiId}</p>
                  )}
                </div>
              )}

              {/* Security Badge */}
              <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">🔒</span>
                  <span className="font-bold text-green-700 text-sm">100% Secure Payment</span>
                </div>
                <p className="text-xs text-gray-600">
                  Your payment information is encrypted and secure. We never store your card details.
                </p>
              </div>
            </aside>
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}
