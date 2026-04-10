import { sendEmail } from "./resendClient.js";

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export async function sendSellerOrderMail({ seller, order, items }) {
  if (!seller?.email || !Array.isArray(items) || items.length === 0) {
    return;
  }

  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            ${
              item.image
                ? `<img src="${item.image}" alt="${escapeHtml(item.name)}" style="width:72px;height:72px;object-fit:cover;border-radius:10px;border:1px solid #e2e8f0;" />`
                : ""
            }
          </td>
          <td style="padding:14px;border-bottom:1px solid #e2e8f0;vertical-align:top;">
            <div style="font-weight:700;color:#0f172a;">${escapeHtml(item.name)}</div>
            <div style="font-size:13px;color:#64748b;margin-top:6px;">
              Qty: ${escapeHtml(item.qty)}<br />
              Price: Rs. ${escapeHtml(item.price)}<br />
              ${item.selectedSize ? `Size: ${escapeHtml(item.selectedSize)}<br />` : ""}
              ${item.selectedColor ? `Color: ${escapeHtml(item.selectedColor)}` : ""}
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
    <div style="background:#f8fafc;padding:28px;font-family:Segoe UI,Arial,sans-serif;">
      <div style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
        <div style="background:#070A52;padding:28px 24px;text-align:center;">
          <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png" alt="UrbanTales" style="width:130px;height:auto;display:block;margin:0 auto 14px auto;" />
          <h1 style="margin:0;color:#FFCC00;font-size:24px;">New Order Received</h1>
        </div>
        <div style="padding:28px;">
          <p style="margin:0 0 12px 0;font-size:16px;color:#0f172a;">
            Hello <strong>${escapeHtml(seller.fullName || seller.shopName || "Seller")}</strong>,
          </p>
          <p style="margin:0 0 18px 0;font-size:14px;line-height:1.7;color:#475569;">
            A new order has been placed for your products. The details are below.
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px;margin-bottom:20px;">
            <div style="font-size:14px;color:#334155;line-height:1.8;">
              <strong>Order ID:</strong> ${escapeHtml(order.orderId || order._id)}<br />
              <strong>Buyer:</strong> ${escapeHtml(order.name)}<br />
              <strong>Mobile:</strong> ${escapeHtml(order.mobile)}<br />
              <strong>Address:</strong> ${escapeHtml(order.address)}<br />
              <strong>Payment:</strong> ${escapeHtml(order.paymentMethod)} (${escapeHtml(
    order.paymentStatus
  )})<br />
              <strong>Instructions:</strong> ${escapeHtml(order.instructions || "None")}
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
            <thead style="background:#f1f5f9;">
              <tr>
                <th style="padding:12px;text-align:left;font-size:13px;color:#475569;">Image</th>
                <th style="padding:12px;text-align:left;font-size:13px;color:#475569;">Item Details</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const text = [
    `New order received for ${seller.fullName || seller.shopName || "Seller"}`,
    `Order ID: ${order.orderId || order._id}`,
    `Buyer: ${order.name}`,
    `Mobile: ${order.mobile}`,
    `Address: ${order.address}`,
    `Payment: ${order.paymentMethod} (${order.paymentStatus})`,
    `Instructions: ${order.instructions || "None"}`,
    "",
    ...items.map(
      (item) =>
        `- ${item.name} | Qty ${item.qty} | Rs. ${item.price}${
          item.selectedSize ? ` | Size ${item.selectedSize}` : ""
        }${item.selectedColor ? ` | Color ${item.selectedColor}` : ""}`
    ),
  ].join("\n");

  return sendEmail({
    to: seller.email,
    subject: `New order ${order.orderId || order._id} on UrbanTales`,
    html,
    text,
    fromName: "UrbanTales Orders",
  });
}
