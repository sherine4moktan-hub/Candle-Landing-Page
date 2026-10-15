import "server-only";

import nodemailer from "nodemailer";
import type { SavedOrder } from "@/lib/order-schema";
import { formatNpr, getDeliveryLabel } from "@/lib/product";

const REQUIRED_EMAIL_ENV = [
  "BUSINESS_EMAIL",
  "EMAIL_FROM",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
] as const;

function assertEmailConfig() {
  const missing = REQUIRED_EMAIL_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Email is not configured. Missing: ${missing.join(", ")}`);
  }
}

function escapeHtml(value: string | number) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function shell(content: string, preheader: string) {
  return `<!doctype html><html><body style="margin:0;background:#f5efe6;font-family:Arial,sans-serif;color:#34251d"><span style="display:none;max-height:0;overflow:hidden">${preheader}</span><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5efe6;padding:24px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#fffdf9;border-radius:20px;overflow:hidden;border:1px solid #eadcca"><tr><td style="background:#3d2417;padding:28px;text-align:center;color:#fff7ec"><div style="font-family:Georgia,serif;font-size:28px;letter-spacing:.04em">${escapeHtml(process.env.BRAND_NAME || "Arinz Candles")}</div><div style="font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#dcbf96;margin-top:7px">Warmth, bottled in amber</div></td></tr><tr><td style="padding:34px 30px">${content}</td></tr><tr><td style="background:#fbf6ee;padding:20px 30px;text-align:center;color:#7c675b;font-size:12px">Need help? Reply to this email and our team will assist you.</td></tr></table></td></tr></table></body></html>`;
}

function row(label: string, value: string | number) {
  return `<tr><td style="padding:9px 0;color:#806b5f;font-size:14px">${escapeHtml(label)}</td><td align="right" style="padding:9px 0;font-size:14px;font-weight:700">${escapeHtml(value)}</td></tr>`;
}

function adminEmail(order: SavedOrder) {
  return shell(`
    <div style="display:inline-block;background:#f2e3cb;color:#8a4f22;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700">NEW ORDER</div>
    <h1 style="font-family:Georgia,serif;font-size:30px;margin:18px 0 8px">A new order has arrived</h1>
    <p style="color:#6f5a4e;line-height:1.6;margin:0 0 24px">Order <strong>${escapeHtml(order.orderId)}</strong> was received on ${escapeHtml(order.dateTime)}.</p>
    <div style="border:1px solid #eadcca;border-radius:14px;padding:18px;margin-bottom:16px"><h2 style="font-size:15px;margin:0 0 10px;text-transform:uppercase;letter-spacing:.1em">Customer</h2><table width="100%">${row("Name", order.name)}${row("Phone", order.phone)}${row("Email", order.email)}${row("Location", order.location)}${row("Delivery area", getDeliveryLabel(order.deliveryZone))}</table></div>
    <div style="border:1px solid #eadcca;border-radius:14px;padding:18px;margin-bottom:16px"><h2 style="font-size:15px;margin:0 0 10px;text-transform:uppercase;letter-spacing:.1em">Order details</h2><table width="100%">${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Price per piece", formatNpr(order.pricePerPiece))}${row("Delivery", formatNpr(order.deliveryFee))}${row("Total", formatNpr(order.totalPrice))}${row("Payment", order.paymentMethod)}${row("Status", order.orderStatus)}</table></div>
    <div style="background:#fff3df;border-left:4px solid #b86e2e;padding:16px;border-radius:8px;font-weight:700">Please call the customer soon to confirm this order.</div>
  `, `New order ${order.orderId}`);
}

function customerEmail(order: SavedOrder) {
  return shell(`
    <div style="font-size:38px">✓</div>
    <h1 style="font-family:Georgia,serif;font-size:31px;margin:12px 0">Thank you for your order, ${escapeHtml(order.name)}!</h1>
    <p style="color:#6f5a4e;line-height:1.7">We have received your order successfully. Our sales representative will call you soon to confirm your order.</p>
    <div style="background:#fbf6ee;border:1px solid #eadcca;border-radius:14px;padding:20px;margin:24px 0"><div style="color:#8b7568;font-size:12px;text-transform:uppercase;letter-spacing:.12em">Order ID</div><div style="font-weight:700;margin:5px 0 14px">${escapeHtml(order.orderId)}</div><table width="100%">${row("Product", order.productName)}${row("Quantity", order.quantity)}${row("Delivery", formatNpr(order.deliveryFee))}${row("Total", formatNpr(order.totalPrice))}${row("Payment method", order.paymentMethod)}</table></div>
    <p style="line-height:1.7">Thank you for choosing ${escapeHtml(process.env.BRAND_NAME || "Arinz Candles")}. We hope your candle brings a little more calm and warmth to your space.</p>
    <p style="margin-top:24px">Warmly,<br><strong>${escapeHtml(process.env.BRAND_NAME || "Arinz Candles")}</strong></p>
  `, `We received your order ${order.orderId}`);
}

export async function sendOrderEmails(order: SavedOrder) {
  assertEmailConfig();
  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await Promise.all([
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.BUSINESS_EMAIL,
      replyTo: order.email,
      subject: `New Product Order Received - ${order.orderId}`,
      html: adminEmail(order),
    }),
    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: order.email,
      replyTo: process.env.BUSINESS_EMAIL,
      subject: `Your Order Has Been Received - ${process.env.BRAND_NAME || "Arinz Candles"}`,
      html: customerEmail(order),
    }),
  ]);
}

export async function verifyEmailConnection() {
  assertEmailConfig();
  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.verify();
}
