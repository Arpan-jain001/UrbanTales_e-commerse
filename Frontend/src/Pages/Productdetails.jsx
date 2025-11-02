import React, { useEffect, useState } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";

const ProductDetails = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    amount: "",
    price: "",
    image: "",
    delivery: ""
  });
  const [isAddBtnDisabled, setIsAddBtnDisabled] = useState(true);

  const requiredFields = ["name", "category", "description", "amount", "price"];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200);
    fetch("http://localhost:3000/api/products/")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch(() => {});
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);
    setIsAddBtnDisabled(!requiredFields.every(f => updatedForm[f].trim() !== ""));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAddBtnDisabled) return;
    fetch("http://localhost:3000/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then((data) => {
        setProducts((prev) => [data, ...prev]);
        setFormData({
          name: "",
          category: "",
          description: "",
          amount: "",
          price: "",
          image: "",
          delivery: ""
        });
        setIsAddBtnDisabled(true);
      });
  };

  const handleRemoveProduct = (prod) => {
    // If you want actual backend delete, send DELETE request here.
    setProducts((prev) => prev.filter((p) => p !== prod));
  };

  const handleFinish = () => {
    if (products.length === 0) {
      alert("Please add at least one product before finishing.");
      return;
    }
    window.location.href = "/dashboard";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#e2eafd] to-[#fff] px-2 md:px-6 py-10">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-extrabold text-blue-700 mb-4">Add Products to Sell</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#070A52] font-medium mb-1">Product Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-[#4287f5]" />
              </div>
              <div>
                <label className="block text-sm text-[#070A52] font-medium mb-1">Category</label>
                <select name="category" required value={formData.category} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  <option value="">Select Category</option>
                  <option value="fashion">Fashion</option>
                  <option value="electronic">Electronics</option>
                  <option value="furniture">Furniture</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="toys">Toys</option>
                  <option value="cosmetic">Cosmetic</option>
                  <option value="food">Food</option>
                  <option value="sports">Sports</option>
                  <option value="appliances">Appliances</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#070A52] font-medium mb-1">Description</label>
                <textarea name="description" required value={formData.description} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm text-[#070A52] font-medium mb-1">Amount</label>
                <input type="number" name="amount" required min="1" value={formData.amount} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm text-[#070A52] font-medium mb-1">Price</label>
                <input type="number" name="price" required min="0" step="0.01" value={formData.price} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#070A52] font-medium mb-1">Image URL</label>
                <input type="text" name="image" value={formData.image} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-[#070A52] font-medium mb-1">Delivery Charge</label>
                <input type="text" name="delivery" value={formData.delivery} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
            </div>
            <button
              type="submit"
              disabled={isAddBtnDisabled}
              className={`w-full mt-4 py-2 rounded-lg text-white font-semibold transition 
              ${isAddBtnDisabled ? "bg-blue-200 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
              + Add More Item
            </button>
          </form>
          {/* List of current products */}
          <div className="mt-10">
            <h3 className="font-bold text-lg mb-2 text-[#070A52]">Product List</h3>
            {products.map((prod, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-300 rounded-xl p-4 mb-4 shadow flex items-center gap-6"
              >
                {prod.image && (
                  <img src={prod.image}
                    alt="Product"
                    className="h-16 w-16 object-contain rounded bg-[#edf0fa] border border-gray-200" />
                )}
                <div className="flex-1">
                  <div className="font-semibold text-[#070A52]">{prod.name}</div>
                  <div className="text-sm text-gray-500">{prod.category} – ₹{prod.price}</div>
                  <div className="text-xs text-gray-600">{prod.description}</div>
                  <div className="text-xs text-gray-400">Amount: {prod.amount} | Delivery: {prod.delivery}</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(prod)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-4 py-1 rounded">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleFinish}
            className="mt-6 w-full py-3 rounded-xl bg-[#070A52] hover:bg-[#FFCC00] text-white font-semibold transition">
            Finish
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetails;
