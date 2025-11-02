import React from "react";
import { motion } from "framer-motion";

export default function SellerProductCard({ product, onEdit, onDelete }) {
  return (
    <motion.div
      className="bg-white shadow rounded-xl p-4 flex flex-col transition hover:shadow-xl"
      whileHover={{ scale: 1.04 }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="h-40 w-full object-cover rounded mb-2"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-[#440077]">{product.name}</h3>
        <p className="text-gray-500 text-sm">{product.description}</p>
        <div className="mt-2 mb-2 font-bold text-lg text-[#440077]">₹{product.price}</div>
        <p className="text-sm text-gray-700">Stock: {product.amount}</p>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          className="bg-yellow-400 text-[#440077] px-3 py-1 rounded font-semibold"
          onClick={() => onEdit(product)}
        >
          Edit
        </button>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded font-semibold"
          onClick={() => onDelete(product)}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
