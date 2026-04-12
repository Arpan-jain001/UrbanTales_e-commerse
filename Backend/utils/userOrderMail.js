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
    <div style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 18px 50px rgba(15,23,42,0.14);">
      <div style="background:linear-gradient(135deg,#070A52 0%,#1d4ed8 55%,#38bdf8 100%);padding:34px 30px;color:#ffffff;">
        <div style="display:inline-block;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,0.14);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
          UrbanTales Orders
        </div>
        <h1 style="margin:16px 0 8px;font-size:30px;line-height:1.2;">${title}</h1>
        <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.88);">${subtitle}</p>
      </div>
      <div style="padding:30px;">${body}</div>
    </div>
  </div>
`;

const buildItemsTable = (items = []) => `
  <table style="width:100%;border-collapse:collapse;margin-top:22px;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
    <thead style="background:#f8fafc;">
      <tr>
        <th style="padding:12px;text-align:left;font-size:12px;color:#475569;">Product</th>
        <th style="padding:12px;text-align:left;font-size:12px;color:#475569;">Variant</th>
        <th style="padding:12px;text-align:left;font-size:12px;color:#475569;">Qty</th>
        <th style="padding:12px;text-align:left;font-size:12px;color:#475569;">Price</th>
      </tr>
    </thead>
    <tbody>
      ${items
        .map(
          (item) => `
            <tr>
              <td style="padding:12px;border-top:1px solid #e2e8f0;font-size:13px;color:#0f172a;font-weight:600;">
                ${escapeHtml(item.name)}
              </td>
              <td style="padding:12px;border-top:1px solid #e2e8f0;font-size:13px;color:#475569;">
                ${escapeHtml(item.selectedSize || "Free Size")} / ${escapeHtml(item.selectedColor || "Default")}
              </td>
              <td style="padding:12px;border-top:1px solid #e2e8f0;font-size:13px;color:#475569;">
                ${escapeHtml(String(item.qty))}
              </td>
              <td style="padding:12px;border-top:1px solid #e2e8f0;font-size:13px;color:#475569;">
                &#8377;${escapeHtml(String(item.price))}
              </td>
            </tr>
          `
        )
        .join("")}
    </tbody>
  </table>
`;

export async function sendUserOrderConfirmationMail({ user, order }) {
  if (!user?.email) return;

  const orderRef = order.orderId || String(order._id);
  const trackingUrl = buildTrackOrderUrl(orderRef);

  const body = `
    <p style="margin:0 0 12px;font-size:16px;color:#0f172a;">
      Hi <strong>${escapeHtml(user.fullName || user.email)}</strong>,
    </p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.8;color:#475569;">
      Your order has been placed successfully. You can follow every stage, including return progress if needed, from the tracking page below.
    </p>
    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:0 0 22px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Order ID</div>
        <div style="margin-top:8px;font-size:18px;font-weight:800;color:#0f172a;">${escapeHtml(orderRef)}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Total Paid</div>
        <div style="margin-top:8px;font-size:18px;font-weight:800;color:#0f172a;">&#8377;${escapeHtml(String(order.totalAmount))}</div>
      </div>
    </div>
    <div style="background:linear-gradient(135deg,#f8fafc 0%,#eef2ff 100%);border:1px solid #dbeafe;border-radius:18px;padding:18px;">
      <p style="margin:0;font-size:13px;color:#334155;line-height:1.8;">
        <strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(order.paymentStatus)})<br />
        <strong>Gift wallet used:</strong> &#8377;${escapeHtml(String(order.giftBalanceUsed || 0))}<br />
        <strong>Delivery address:</strong> ${escapeHtml(order.address)}
      </p>
    </div>
    ${buildItemsTable(order.items || [])}
    <div style="margin-top:26px;text-align:center;">
      <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#070A52 0%,#1d4ed8 100%);color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:14px;font-weight:700;">
        Track Your Order
      </a>
    </div>
    <p style="margin:22px 0 0;font-size:12px;line-height:1.7;color:#64748b;">
      If the button does not open, copy this link into your browser:<br />
      <a href="${trackingUrl}" style="color:#2563eb;word-break:break-all;">${trackingUrl}</a>
    </p>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order confirmed: ${orderRef}`,
    html: buildShell({
      title: "Your order is confirmed",
      subtitle: "Thank you for shopping with UrbanTales. We will keep you updated at every key stage.",
      body,
    }),
    text: [
      `Hello ${user.fullName || user.email},`,
      `Your order ${orderRef} is confirmed.`,
      `Total: Rs. ${order.totalAmount}`,
      `Payment: ${order.paymentMethod} (${order.paymentStatus})`,
      `Gift wallet used: Rs. ${order.giftBalanceUsed || 0}`,
      `Track your order: ${trackingUrl}`,
    ].join("\n"),
    fromName: "UrbanTales Orders",
  });
}

export async function sendUserOrderStatusMail({ user, order, item }) {
  if (!user?.email || !item) return;

  const orderRef = order.orderId || String(order._id);
  const trackingUrl = buildTrackOrderUrl(orderRef);

  const body = `
    <p style="margin:0 0 12px;font-size:16px;color:#0f172a;">
      Hi <strong>${escapeHtml(user.fullName || user.email)}</strong>,
    </p>
    <p style="margin:0 0 18px;font-size:14px;line-height:1.8;color:#475569;">
      The status of <strong>${escapeHtml(item.name)}</strong> in your order has moved to <strong>${escapeHtml(item.status)}</strong>.
    </p>
    <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;">
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Order</div>
        <div style="margin-top:8px;font-size:16px;font-weight:800;color:#0f172a;">${escapeHtml(orderRef)}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Quantity</div>
        <div style="margin-top:8px;font-size:16px;font-weight:800;color:#0f172a;">${escapeHtml(String(item.qty))}</div>
      </div>
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:16px;">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#64748b;font-weight:700;">Status</div>
        <div style="margin-top:8px;font-size:16px;font-weight:800;color:#0f172a;">${escapeHtml(item.status)}</div>
      </div>
    </div>
    <div style="margin-top:20px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:18px;padding:18px;">
      <p style="margin:0;font-size:13px;line-height:1.8;color:#334155;">
        <strong>Product:</strong> ${escapeHtml(item.name)}<br />
        <strong>Variant:</strong> ${escapeHtml(item.selectedSize || "Free Size")} / ${escapeHtml(item.selectedColor || "Default")}<br />
        <strong>Tracking link:</strong> <a href="${trackingUrl}" style="color:#2563eb;">Open tracking page</a>
      </p>
    </div>
    <div style="margin-top:24px;text-align:center;">
      <a href="${trackingUrl}" style="display:inline-block;background:linear-gradient(135deg,#070A52 0%,#1d4ed8 100%);color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:14px;font-weight:700;">
        View Live Tracking
      </a>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order update: ${item.name} is now ${item.status}`,
    html: buildShell({
      title: "Order status updated",
      subtitle: "Your tracking page has the latest order and return stage details.",
      body,
    }),
    text: [
      `Hello ${user.fullName || user.email},`,
      `The item ${item.name} in order ${orderRef} is now ${item.status}.`,
      `Track order: ${trackingUrl}`,
    ].join("\n"),
    fromName: "UrbanTales Orders",
  });
}
