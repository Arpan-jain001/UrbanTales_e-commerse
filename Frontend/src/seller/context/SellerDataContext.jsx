import React, { createContext, useContext, useState } from "react";

const SellerDataContext = createContext();

export function SellerDataProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  return (
    <SellerDataContext.Provider value={{ products, setProducts, orders, setOrders }}>
      {children}
    </SellerDataContext.Provider>
  );
}
export function useSellerData() { return useContext(SellerDataContext); }
