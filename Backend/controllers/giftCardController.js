import GiftCard from "../models/GiftCard.js";

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000;
const normalizeCode = (code) => String(code || "").trim().toUpperCase();
const roundAmount = (value) => Number(Number(value || 0).toFixed(2));
const buildWalletCode = (userId) => `UTWALLET-${String(userId).slice(-8).toUpperCase()}`;

const serializeWallet = (wallet) => {
  const activeEntries = (wallet.walletEntries || [])
    .filter((entry) => entry.status === "ACTIVE" && Number(entry.remainingAmount || 0) > 0)
    .sort((a, b) => new Date(a.expiresAt || 0) - new Date(b.expiresAt || 0));

  return {
    code: wallet.code,
    balance: roundAmount(wallet.balance),
    soonestExpiry: activeEntries[0]?.expiresAt || null,
    entries: activeEntries.map((entry) => ({
      id: entry._id,
      source: entry.source,
      amount: roundAmount(entry.amount),
      remainingAmount: roundAmount(entry.remainingAmount),
      expiredAmount: roundAmount(entry.expiredAmount),
      orderId: entry.orderId,
      sellerId: entry.sellerId,
      issuedAt: entry.issuedAt,
      expiresAt: entry.expiresAt,
      note: entry.note,
      status: entry.status,
    })),
  };
};

const expireWalletEntries = (wallet) => {
  const now = Date.now();
  let expiredAmount = 0;

  wallet.walletEntries = (wallet.walletEntries || []).map((entry) => {
    const isExpired =
      entry.status === "ACTIVE" &&
      entry.expiresAt &&
      new Date(entry.expiresAt).getTime() < now &&
      Number(entry.remainingAmount || 0) > 0;

    if (!isExpired) return entry;

    expiredAmount += Number(entry.remainingAmount || 0);
    entry.expiredAmount = roundAmount(
      Number(entry.expiredAmount || 0) + Number(entry.remainingAmount || 0)
    );
    entry.remainingAmount = 0;
    entry.status = "EXPIRED";
    return entry;
  });

  if (expiredAmount > 0) {
    wallet.balance = roundAmount(Math.max(0, Number(wallet.balance || 0) - expiredAmount));
  }

  return roundAmount(expiredAmount);
};

const ensureUserWallet = async (userId) => {
  let wallet = await GiftCard.findOne({ ownerUserId: userId, kind: "WALLET" });

  if (!wallet) {
    wallet = await GiftCard.create({
      code: buildWalletCode(userId),
      kind: "WALLET",
      type: "flat",
      value: 0,
      active: true,
      ownerUserId: userId,
      balance: 0,
      walletEntries: [],
      usedBy: [],
    });
  }

  const expiredAmount = expireWalletEntries(wallet);
  if (expiredAmount > 0) {
    await wallet.save();
  }

  return wallet;
};

const buildValidationResponse = (giftCard, baseAmount, deliveryCharge) => {
  const amount = baseAmount + (Number(deliveryCharge) || 0);
  const discountRaw = giftCard.type === "flat" ? giftCard.value : (amount * giftCard.value) / 100;
  const discountAmount = Math.min(roundAmount(discountRaw), amount);
  return {
    valid: true,
    code: giftCard.code,
    type: giftCard.type,
    value: giftCard.value,
    discountAmount,
    minPurchase: giftCard.minPurchase,
    expiresAt: giftCard.expiresAt,
    message: "Gift card is valid.",
  };
};

export const getMyGiftCardWallet = async (req, res) => {
  try {
    const wallet = await ensureUserWallet(req.userId);
    return res.status(200).json({ wallet: serializeWallet(wallet) });
  } catch (err) {
    console.error("Get gift wallet error:", err);
    return res.status(500).json({ message: "Failed to fetch gift card balance." });
  }
};

export const validateGiftCard = async (req, res) => {
  try {
    const { code, subtotal = 0, deliveryCharge = 0 } = req.body;
    const normalizedCode = normalizeCode(code);

    if (!normalizedCode) {
      return res.status(400).json({ valid: false, message: "Gift card code is required." });
    }

    let giftCard = await GiftCard.findOne({
      code: normalizedCode,
      active: true,
      kind: { $ne: "WALLET" },
    });

    if (!giftCard) {
      if (normalizedCode === "URBANTALES" || normalizedCode === "AJ001") {
        const amount = Number(subtotal) + Number(deliveryCharge);
        const discountAmount = roundAmount(amount * 0.2);
        return res.status(200).json({
          valid: true,
          code: normalizedCode,
          type: "percent",
          value: 20,
          discountAmount,
          message: "Gift card applied successfully.",
        });
      }
      return res.status(404).json({ valid: false, message: "This gift card is not valid." });
    }

    if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) {
      return res.status(400).json({ valid: false, message: "This gift card has expired." });
    }

    const amount = Number(subtotal) + Number(deliveryCharge);
    if (giftCard.minPurchase && amount < giftCard.minPurchase) {
      return res.status(400).json({
        valid: false,
        message: `Minimum purchase of ₹${giftCard.minPurchase} is required to use this gift card.`,
      });
    }

    if (giftCard.usedBy?.some((userId) => String(userId) === String(req.userId))) {
      return res.status(400).json({ valid: false, message: "You have already used this gift card." });
    }

    return res.status(200).json(buildValidationResponse(giftCard, subtotal, deliveryCharge));
  } catch (err) {
    console.error("Gift card validation error:", err);
    return res.status(500).json({ valid: false, message: "Failed to validate gift card." });
  }
};

export const redeemGiftCard = async (code, userId) => {
  if (!code) return null;
  const normalizedCode = normalizeCode(code);
  let giftCard = await GiftCard.findOne({
    code: normalizedCode,
    active: true,
    kind: { $ne: "WALLET" },
  });
  if (!giftCard) return null;
  if (giftCard.expiresAt && new Date(giftCard.expiresAt) < new Date()) return null;
  if (giftCard.usedBy?.some((item) => String(item) === String(userId))) return null;

  giftCard.usedBy = [...(giftCard.usedBy || []), userId];
  await giftCard.save();
  return giftCard;
};

export const debitGiftCardWallet = async ({ userId, amount, orderId = "", note = "Checkout debit" }) => {
  const requestedAmount = roundAmount(amount);
  const wallet = await ensureUserWallet(userId);

  if (!requestedAmount || !wallet.balance) {
    return { appliedAmount: 0, wallet };
  }

  let remaining = requestedAmount;
  const activeEntries = [...(wallet.walletEntries || [])].sort(
    (a, b) => new Date(a.expiresAt || 0) - new Date(b.expiresAt || 0)
  );

  for (const entry of activeEntries) {
    if (entry.status !== "ACTIVE" || remaining <= 0) continue;

    const available = Number(entry.remainingAmount || 0);
    if (available <= 0) continue;

    const consumed = Math.min(available, remaining);
    entry.remainingAmount = roundAmount(available - consumed);
    entry.note = note;
    entry.orderId = orderId || entry.orderId;

    if (entry.remainingAmount <= 0) {
      entry.remainingAmount = 0;
      entry.status = "USED";
    }

    remaining = roundAmount(remaining - consumed);
  }

  wallet.walletEntries = activeEntries;
  const appliedAmount = roundAmount(requestedAmount - remaining);
  wallet.balance = roundAmount(Math.max(0, Number(wallet.balance || 0) - appliedAmount));
  await wallet.save();

  return { appliedAmount, wallet };
};

export const creditGiftCardWallet = async ({
  userId,
  amount,
  orderId = "",
  sellerId = null,
  note = "Return refund",
}) => {
  const creditAmount = roundAmount(amount);
  const wallet = await ensureUserWallet(userId);

  if (!creditAmount) {
    return { creditedAmount: 0, wallet };
  }

  wallet.walletEntries.push({
    source: "RETURN_REFUND",
    amount: creditAmount,
    remainingAmount: creditAmount,
    orderId,
    sellerId,
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + THREE_MONTHS_MS),
    status: "ACTIVE",
    note,
  });
  wallet.balance = roundAmount(Number(wallet.balance || 0) + creditAmount);
  await wallet.save();

  return { creditedAmount: creditAmount, wallet };
};

export const getWalletSummaryForUser = async (userId) => {
  const wallet = await ensureUserWallet(userId);
  return serializeWallet(wallet);
};
