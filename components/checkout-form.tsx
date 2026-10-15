"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { ArrowLeft, Check, LoaderCircle, LockKeyhole, PackageCheck, ShieldCheck } from "lucide-react";
import { PRODUCT, formatNpr, getDeliveryLabel, type DeliveryZone } from "@/lib/product";
import { BrandLogo } from "@/components/brand-logo";

type FieldErrors = Record<string, string[]>;

function initialSubmissionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-0000-4000-8000-000000000000`.slice(-36);
}

export function CheckoutForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuantity = Math.min(10, Math.max(1, Number(searchParams.get("quantity")) || 1));
  const initialZone: DeliveryZone = searchParams.get("zone") === "outside" ? "outside" : "kathmandu";
  const [quantity, setQuantity] = useState(initialQuantity);
  const [zone, setZone] = useState<DeliveryZone>(initialZone);
  const [submissionId] = useState(initialSubmissionId);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const deliveryFee = PRODUCT.deliveryFees[zone];
  const total = PRODUCT.offerPrice * quantity + deliveryFee;
  const totalLabel = useMemo(() => formatNpr(total), [total]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setMessage("");
    setErrors({});

    const data = new FormData(event.currentTarget);
    const payload = {
      submissionId,
      name: data.get("name"),
      phone: data.get("phone"),
      email: data.get("email"),
      location: data.get("location"),
      productName: PRODUCT.name,
      quantity,
      pricePerPiece: PRODUCT.offerPrice,
      deliveryZone: zone,
      totalPrice: total,
    };

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrors(result.errors || {});
        throw new Error(result.message || "Order submission failed.");
      }
      const params = new URLSearchParams({
        orderId: result.order.orderId,
        product: result.order.productName,
        quantity: String(result.order.quantity),
        total: String(result.order.totalPrice),
      });
      router.push(`/thank-you?${params.toString()}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't place your order. Please try again in a moment.");
      setSubmitting(false);
    }
  }

  const errorFor = (name: string) => errors[name]?.[0];

  return (
    <main className="min-h-screen bg-[#f2e7d8] px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <BrandLogo className="h-auto w-[180px] sm:w-[210px]" />
          <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-[#6e5546] hover:text-[#2d1a12]"><ArrowLeft size={17} /> Back to product</button>
        </div>
        <div className="grid overflow-hidden rounded-[1.75rem] border border-white/70 bg-[#fffdf9] soft-shadow lg:grid-cols-[1.08fr_.92fr]">
          <section className="p-5 sm:p-7 lg:p-8">
            <div className="eyebrow text-[#9a5b2c]">Secure Cash on Delivery order</div>
            <h1 className="font-display mt-2 text-4xl font-semibold tracking-tight sm:text-[2.75rem]">Where should we deliver?</h1>
            <p className="mt-2 text-sm leading-6 text-[#7b6659]">Enter your details below. We’ll email your receipt and call to confirm the order.</p>

            <form onSubmit={submit} className="mt-5 space-y-3.5" noValidate>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-extrabold">Full name</label>
                <input id="name" name="name" autoComplete="name" className={`field ${errorFor("name") ? "field-error" : ""}`} placeholder="Your full name" aria-describedby={errorFor("name") ? "name-error" : undefined} />
                {errorFor("name") && <p id="name-error" className="mt-1.5 text-xs font-semibold text-[#a83c36]">{errorFor("name")}</p>}
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="phone" className="mb-1.5 block text-sm font-extrabold">Phone number</label>
                  <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" className={`field ${errorFor("phone") ? "field-error" : ""}`} placeholder="98XXXXXXXX" />
                  {errorFor("phone") && <p className="mt-1.5 text-xs font-semibold text-[#a83c36]">{errorFor("phone")}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-extrabold">Email address</label>
                  <input id="email" name="email" type="email" autoComplete="email" className={`field ${errorFor("email") ? "field-error" : ""}`} placeholder="you@example.com" />
                  {errorFor("email") && <p className="mt-1.5 text-xs font-semibold text-[#a83c36]">{errorFor("email")}</p>}
                </div>
              </div>
              <div>
                <label htmlFor="location" className="mb-1.5 block text-sm font-extrabold">Exact location</label>
                <textarea id="location" name="location" autoComplete="street-address" rows={2} className={`field resize-none ${errorFor("location") ? "field-error" : ""}`} placeholder="Kindly share your exact location" />
                {errorFor("location") && <p className="mt-1.5 text-xs font-semibold text-[#a83c36]">{errorFor("location")}</p>}
              </div>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="zone" className="mb-1.5 block text-sm font-extrabold">Delivery area</label>
                  <select id="zone" value={zone} onChange={(event) => setZone(event.target.value as DeliveryZone)} className="field">
                    <option value="kathmandu">Inside Kathmandu Valley</option>
                    <option value="outside">Outside Kathmandu Valley</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="quantity" className="mb-1.5 block text-sm font-extrabold">Quantity</label>
                  <select id="quantity" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="field">
                    {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </div>
              </div>

              {message && <div role="alert" className="rounded-xl border border-[#e5aaa5] bg-[#fff0ef] p-4 text-sm font-semibold leading-6 text-[#8f312c]">{message}</div>}

              <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-65">
                {submitting ? <><LoaderCircle size={18} className="animate-spin" /> Submitting order...</> : <>Order now — <span className="price-figures">{totalLabel}</span></>}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs text-[#7d685b]"><LockKeyhole size={14} /> Your details are sent securely and never exposed publicly.</div>
            </form>
          </section>

          <aside className="bg-[#321f15] p-5 text-white sm:p-7 lg:p-8">
            <div className="group relative aspect-[16/8.5] overflow-hidden rounded-[1.4rem] bg-[#d6b28c]"><Image src={PRODUCT.images[0]} alt={PRODUCT.name} fill sizes="(max-width: 1024px) 90vw, 40vw" className="object-cover transition-transform duration-500 group-hover:scale-105" priority /></div>
            <h2 className="font-display mt-5 text-3xl font-semibold">Your order</h2>
            <div className="mt-3 space-y-2 border-y border-white/15 py-4 text-sm">
              <div className="flex justify-between gap-5"><span className="text-white/65">Product</span><span className="text-right font-bold">{PRODUCT.shortName}</span></div>
              <div className="flex justify-between"><span className="text-white/65">Quantity</span><span className="font-bold">{quantity}</span></div>
              <div className="flex justify-between"><span className="text-white/65">Regular price</span><span className="price-figures font-semibold text-white/55 line-through">{formatNpr(PRODUCT.regularPrice * quantity)}</span></div>
              <div className="flex justify-between"><span className="text-white/65">Offer subtotal</span><span className="price-figures font-bold">{formatNpr(PRODUCT.offerPrice * quantity)}</span></div>
              <div className="flex justify-between text-[#e1b583]"><span>You save</span><span className="price-figures font-bold">− {formatNpr((PRODUCT.regularPrice - PRODUCT.offerPrice) * quantity)}</span></div>
              <div className="flex justify-between"><span className="text-white/65">Delivery</span><span className="price-figures font-bold">{formatNpr(deliveryFee)}</span></div>
              <div className="flex justify-between"><span className="text-white/65">Area</span><span className="text-right font-bold">{getDeliveryLabel(zone)}</span></div>
            </div>
            <div className="flex items-end justify-between py-4"><span className="font-bold">Total</span><span className="price-figures text-3xl font-extrabold">{totalLabel}</span></div>
            <div className="rounded-2xl bg-white/8 p-4 text-sm leading-5 text-white/75">
              {[ [Check, "Cash on Delivery — no advance payment"], [PackageCheck, "Delivery expected within 2–3 days"], [ShieldCheck, "Phone confirmation before dispatch"] ].map(([Icon, text]) => { const RowIcon = Icon as typeof Check; return <div key={text as string} className="flex items-start gap-3 py-1.5"><RowIcon className="mt-0.5 shrink-0 text-[#d6a979]" size={17} /><span>{text as string}</span></div>; })}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
