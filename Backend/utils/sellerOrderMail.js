import { sendEmail } from "./resendClient.js";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

const buildTrackOrderUrl = (orderId) =>
  `${getFrontendUrl()}/trackorder?orderId=${encodeURIComponent(orderId)}`;

const buildShell = ({ title, subtitle, body }) => `
  <div style="margin:0;background:#eef2ff;padding:28px 14px;font-family:Segoe UI,Arial,sans-serif;">
    <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,0.14);">
      <div style="background:linear-gradient(135deg,#070A52 0%,#4338ca 55%,#38bdf8 100%);padding:34px 30px;color:#ffffff;">
        <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,0.14);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
          UrbanTales Seller Desk
        </div>
        <h1 style="margin:16px 0 8px;font-size:30px;line-height:1.2;">${title}</h1>
        <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.88);">${subtitle}</p>
      </div>
      <div style="padding:30px;">${body}</div>
    </div>
  </div>
`;

const buildItemsCards = (items = []) =>
  items
    .map(
      (item) => `
        <div style="display:flex;gap:14px;padding:14px;border:1px solid #e2e8f0;border-radius:18px;background:#f8fafc;margin-top:14px;">
          ${
            item.image
              ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" style="width:74px;height:74px;object-fit:cover;border-radius:14px;border:1px solid #dbeafe;background:#fff;" />`
              : ""
          }
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;font-weight:800;color:#0f172a;">${escapeHtml(item.name)}</div>
            <div style="margin-top:6px;font-size:13px;line-height:1.8;color:#475569;">
              Qty: ${escapeHtml(String(item.qty || 1))}<br />
              Price: &#8377;${escapeHtml(String(item.price || 0))}<br />
              Size: ${escapeHtml(item.selectedSize || "Free Size")}<br />
              Color: ${escapeHtml(item.selectedColor || "Default")}
            </div>
          </div>
        </div>
      `
    )
    .join("");

export async function sendSellerOrderMail({ seller, order, items }) {
  if (!seller?.email || !Array.isArray(items) || items.length === 0) {
    return;
  }

  const orderRef = order.orderId || String(order._id);
  const trackingUrl = buildTrackOrderUrl(orderRef);
  const sellerName = seller.shopName || seller.fullName || "Seller";
  const sellerItemsTotal = items.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  );

  const body = `
    <p style="margin:0 0 12px;font-size:16px;color:#0f172a;">
      Hello <strong>${escapeHtml(sellerName)}</strong>,
    </p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.8;color:#475569;">
      A new order has been placed for your store. Everything you need to fulfill it is included below, along with a direct tracking link.
    </p>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:0 0 22px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Order ID</div>
        <div style="margin-top:8px;font-size:18px;font-weight:800;color:#0f172a;">${escapeHtml(orderRef)}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Your Items Total</div>
        <div style="margin-top:8px;font-size:18px;font-weight:800;color:#0f172a;">&#8377;${escapeHtml(
          sellerItemsTotal.toFixed(2)
        )}</div>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%);border:1px solid #dbeafe;border-radius:18px;padding:18px;">
      <p style="margin:0;font-size:13px;line-height:1.8;color:#334155;">
        <strong>Buyer:</strong> ${escapeHtml(order.name)}<br />
        <strong>Mobile:</strong> ${escapeHtml(order.mobile)}<br />
        <strong>Address:</strong> ${escapeHtml(order.address)}<br />
        <strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(
          order.paymentStatus
        )})<br />
        <strong>Instructions:</strong> ${escapeHtml(order.instructions || "None")}<br />
        <strong>Track:</strong> <a href="${trackingUrl}" style="color:#2563eb;">Open order tracking page</a>
      </p>
    </div>
    <div style="margin-top:22px;">
      <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#64748b;">
        Seller Items
      </div>
      ${buildItemsCards(items)}
    </div>
    <div style="margin-top:26px;text-align:center;">
      <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#070A52 0%,#1d4ed8 100%);color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:14px;font-weight:700;">
        View Tracking
      </a>
    </div>
  `;

  return sendEmail({
    to: seller.email,
    subject: `New order received: ${orderRef}`,
    html: buildShell({
      title: "A new order just arrived",
      subtitle:
        "Customer details, product variants, and tracking access are ready for you.",
      body,
    }),
    text: [
      `Hello ${sellerName},`,
      `A new order has been placed for your products.`,
      `Order ID: ${orderRef}`,
      `Buyer: ${order.name}`,
      `Mobile: ${order.mobile}`,
      `Address: ${order.address}`,
      `Payment: ${order.paymentMethod} (${order.paymentStatus})`,
      `Instructions: ${order.instructions || "None"}`,
      `Tracking: ${trackingUrl}`,
      "",
      "Items:",
      ...items.map(
        (item) =>
          `- ${item.name} | Qty ${item.qty} | Rs. ${item.price} | Size: ${
            item.selectedSize || "Free Size"
          } | Color: ${item.selectedColor || "Default"}`
      ),
    ].join("\n"),
    fromName: "UrbanTales Seller Orders",
  });
}
