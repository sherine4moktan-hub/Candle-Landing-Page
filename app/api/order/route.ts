import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { orderSchema, type SavedOrder } from "@/lib/order-schema";
import { PRODUCT } from "@/lib/product";
import { saveOrderToSheet } from "@/lib/google-sheets";
import { sendOrderEmails } from "@/lib/email";

export const runtime = "nodejs";

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  try {
    const normalizedOrigin = new URL(origin).origin;
    const allowedOrigins = new Set<string>();

    for (const value of [
      request.nextUrl.origin,
      process.env.FRONTEND_URL,
      process.env.NEXT_PUBLIC_SITE_URL,
    ]) {
      if (!value) continue;
      try {
        allowedOrigins.add(new URL(value).origin);
      } catch {
        // Ignore malformed optional environment values and continue with the
        // request host, which is the authoritative same-origin signal.
      }
    }

    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const host = forwardedHost || request.headers.get("host");
    if (host) {
      const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
      const protocol = forwardedProtocol || request.nextUrl.protocol.replace(":", "") || "https";
      allowedOrigins.add(`${protocol}://${host}`);
    }

    return allowedOrigins.has(normalizedOrigin);
  } catch {
    return false;
  }
}

function buildOrderId(submissionId: string) {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = createHash("sha256").update(submissionId).digest("hex").slice(0, 7).toUpperCase();
  return `ARZ-${day}-${suffix}`;
}

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ message: "Request origin is not allowed." }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const parsed = orderSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please correct the highlighted details.", errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const deliveryFee = PRODUCT.deliveryFees[input.deliveryZone];
    const expectedTotal = PRODUCT.offerPrice * input.quantity + deliveryFee;

    // Product and money values are canonical on the server; browser values are
    // accepted for validation only and can never change the charged total.
    if (
      input.productName !== PRODUCT.name ||
      input.pricePerPiece !== PRODUCT.offerPrice ||
      input.totalPrice !== expectedTotal
    ) {
      return NextResponse.json(
        { message: "Order pricing changed. Please return to the product page and try again." },
        { status: 409 },
      );
    }

    const order: SavedOrder = {
      ...input,
      orderId: buildOrderId(input.submissionId),
      createdAt: new Date().toISOString(),
      dateTime: new Intl.DateTimeFormat("en-NP", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kathmandu",
      }).format(new Date()),
      deliveryFee,
      paymentMethod: "Cash On Delivery",
      orderStatus: "New Order",
      notes: "",
    };

    await saveOrderToSheet(order);
    await sendOrderEmails(order);

    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
      },
    });
  } catch (error) {
    console.error("Order submission failed:", error);
    return NextResponse.json(
      { message: "We couldn't place your order right now. Please try again in a moment." },
      { status: 500 },
    );
  }
}
