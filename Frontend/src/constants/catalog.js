export const NAV_CATEGORY_MAP = [
  {
    label: "Fashion",
    value: "fashion",
    subcategories: ["Men", "Women", "Kids", "Accessories", "Luggages"],
  },
  {
    label: "Electronics",
    value: "electronic",
    subcategories: ["Laptops", "Tablets", "Cameras", "Headphones", "Smartwatches"],
  },
  {
    label: "Home & Furniture",
    value: "furniture",
    subcategories: ["Living Room", "Bedroom", "Kitchen", "Office", "Outdoor"],
  },
  { label: "Appliances", value: "kitchen", subcategories: [] },
  {
    label: "Toys",
    value: "toys",
    subcategories: ["Action Figures", "Dolls", "Puzzles", "Board Games"],
  },
  { label: "Cosmetics", value: "cosmetic", subcategories: [] },
  { label: "Kilos", value: "food", subcategories: [] },
  { label: "Sports", value: "sports", subcategories: [] },
];

export const CATEGORY_OPTIONS = NAV_CATEGORY_MAP.map(({ label, value }) => ({
  label,
  value,
}));

export const SUBCATEGORY_MAP = NAV_CATEGORY_MAP.reduce((acc, item) => {
  acc[item.value] = item.subcategories || [];
  return acc;
}, {});

export const FASHION_SIZE_PRESETS = {
  Men: ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "40"],
  Women: ["Free Size", "XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36"],
  Kids: ["Free Size", "0-1Y", "1-2Y", "2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"],
  Accessories: ["Free Size"],
  Luggages: ["Free Size"],
};

export const getSizeOptionsForProduct = (category, subCategory) => {
  if (String(category || "").toLowerCase() !== "fashion") {
    return ["Free Size"];
  }
  return FASHION_SIZE_PRESETS[subCategory] || ["Free Size"];
};
