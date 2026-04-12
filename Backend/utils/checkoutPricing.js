import Cart from "../models/Cart.js";
import GiftCard from "../models/GiftCard.js";
import Product from "../models/product.js";
import {
  debitGiftCardWallet,
  getWalletSummaryForUser,
  redeemGiftCard,
} from "../controllers/giftCardController.js";

const PROMO_CODES = new Set(["URBANTALES", "AJ001"]);

export const roundAmount = (value) => Number(Number(value || 0).toFixed(2));

const buildHttpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const normalizeGiftCode = (code) => String(code || "").trim().toUpperCase();

const resolveGiftCode = async ({
  code,
  userId,
  subtotal,
  deliveryCharge,
  consumeGiftCode = false,
}) => {
  const normalizedCode = normalizeGiftCode(code);
  if (!normalizedCode) {
    return {
      appliedGiftCode: "",
      appliedGiftType: "",
      appliedDiscountAmount: 0,
    };
  }

  const amount = roundAmount(subtotal + deliveryCharge);

  if (PROMO_CODES.has(normalizedCode)) {
    return {
      appliedGiftCode: normalizedCode,
      appliedGiftType: "percent",
      appliedDiscountAmount: roundAmount(Math.min(amount * 0.2, amount)),
    };
  }

  const giftCard = consumeGiftCode
    ? await redeemGiftCard(normalizedCode, userId)
    : await GiftCard.findOne({
        code: normalizedCode,
        active: true,
        kind: { $ne: "WALLET" },
      });

  if (!giftCard) {
    throw buildHttpError(400, "Invalid or already used gift card.");
  }

  if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
    throw buildHttpError(400, "This gift card has expired.");
  }

  if (
    !consumeGiftCode &&
    giftCard.usedBy?.some((item) => String(item) === String(userId))
  ) {
    throw buildHttpError(400, "You have already used this gift card.");
  }

  if (giftCard.minPurchase && amount < Number(giftCard.minPurchase || 0)) {
    throw buildHttpError(
      400,
      `Minimum purchase of ₹${giftCard.minPurchase} is required to use this gift card.`
    );
  }

  const rawDiscount =
    giftCard.type === "flat"
      ? Number(giftCard.value || 0)
      : (amount * Number(giftCard.value || 0)) / 100;

  return {
    appliedGiftCode: giftCard.code,
    appliedGiftType: giftCard.type,
    appliedDiscountAmount: roundAmount(Math.min(rawDiscount, amount)),
  };
};

export const calculateCheckoutPricing = async ({
  userId,
  giftCode = "",
  useGiftBalance = false,
  deliveryCharge = 0,
  consumeGiftCode = false,
  consumeWallet = false,
  walletOrderId = "",
  walletNote = "Checkout debit",
}) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    throw buildHttpError(400, "Cart is empty, cannot continue checkout.");
  }

  const productIds = cart.items.map((item) => item.id).filter(Boolean);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "_id name price stock sellerId image images"
  );
  const productMap = new Map(products.map((product) => [String(product._id), product]));

  const orderItems = cart.items.map((item) => {
    const product = productMap.get(String(item.id));
    if (!product) {
      throw buildHttpError(404, `${item.name || "Product"} is no longer available.`);
    }

    const requestedQty = Number(item.qty || 0);
    if (requestedQty <= 0) {
      throw buildHttpError(400, "Invalid item quantity in cart.");
    }

    if (Number(product.stock || 0) < requestedQty) {
      throw buildHttpError(
        400,
        `${product.name} only has ${product.stock} item(s) left in stock.`
      );
    }

    return {
      id: String(product._id),
      sellerId: String(product.sellerId || item.sellerId || ""),
      name: product.name || item.name || "",
      price: roundAmount(product.price ?? item.price ?? 0),
      image:
        item.selectedColorImage ||
        product.images?.[0] ||
        product.image ||
        item.image ||
        "",
      qty: requestedQty,
      selectedSize: item.selectedSize || "",
      selectedColor: item.selectedColor || "",
      selectedColorImage: item.selectedColorImage || "",
      status: item.status || "Pending",
    };
  });

  const normalizedDeliveryCharge = roundAmount(deliveryCharge);
  const subtotal = roundAmount(
    orderItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
      0
    )
  );

  const {
    appliedGiftCode,
    appliedGiftType,
    appliedDiscountAmount,
  } = await resolveGiftCode({
    code: giftCode,
    userId,
    subtotal,
    deliveryCharge: normalizedDeliveryCharge,
    consumeGiftCode,
  });

  const intermediateTotal = roundAmount(
    Math.max(0, subtotal + normalizedDeliveryCharge - appliedDiscountAmount)
  );

  let appliedGiftBalance = 0;
  let walletPreview = null;

  if (useGiftBalance) {
    if (consumeWallet) {
      const walletResult = await debitGiftCardWallet({
        userId,
        amount: intermediateTotal,
        orderId: walletOrderId,
        note: walletNote,
      });
      appliedGiftBalance = roundAmount(walletResult.appliedAmount);
    } else {
      walletPreview = await getWalletSummaryForUser(userId);
      appliedGiftBalance = roundAmount(
        Math.min(Number(walletPreview.balance || 0), intermediateTotal)
      );
    }
  }

  const totalAmount = roundAmount(
    Math.max(0, intermediateTotal - Number(appliedGiftBalance || 0))
  );

  return {
    cart,
    orderItems,
    subtotal,
    deliveryCharge: normalizedDeliveryCharge,
    discountAmount: appliedDiscountAmount,
    giftCode: appliedGiftCode,
    giftType: appliedGiftType,
    giftBalanceUsed: appliedGiftBalance,
    totalAmount,
    walletPreview,
  };
};
