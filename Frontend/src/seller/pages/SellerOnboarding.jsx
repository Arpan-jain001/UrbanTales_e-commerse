import React from "react";
import SellerNavbar from "../components/SellerNavbar";
import SellerFooter from "../components/SellerFooter";
import { useNavigate } from "react-router-dom";

export default function SellerOnboarding() {
  const navigate = useNavigate();

  return (
    <>
      <SellerNavbar />
      <div className="flex-1 bg-[#f8f6fc] min-h-screen flex justify-center py-12 px-5">
        <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="w-full flex flex-col md:flex-row md:space-x-7 items-center">
            <img
              src="https://img.freepik.com/premium-vector/work-from-home-concept-happy-woman-selling-products-online-home_218660-278.jpg?w=800"
              alt="Onboarding Banner"
              className="max-w-xs w-full h-auto"
            />
            <div className="mt-6 md:mt-0 text-[#440077]">
              <h2 className="text-2xl font-bold mb-4">Become a Seller in 4 Easy Steps!</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>Register your seller account</li>
                <li>Choose your product storage and shipping</li>
                <li>List your products</li>
                <li>Complete orders and get paid</li>
              </ol>
              <button
                onClick={() => navigate("/seller/signup")}
                className="mt-7 px-7 py-2 bg-[#440077] text-yellow-300 rounded font-bold text-lg shadow hover:bg-yellow-400 hover:text-[#440077]"
              >
                Start Selling Now
              </button>
            </div>
          </div>
        </div>
      </div>
      <SellerFooter />
    </>
  );
}
