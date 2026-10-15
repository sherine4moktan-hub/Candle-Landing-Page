"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Home, Mail, PhoneCall } from "lucide-react";
import { PRODUCT, formatNpr } from "@/lib/product";

export function ThankYouContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || "Confirmed";
  const product = params.get("product") || PRODUCT.name;
  const quantity = Math.max(1, Number(params.get("quantity")) || 1);
  const total = Math.max(PRODUCT.offerPrice, Number(params.get("total")) || PRODUCT.offerPrice);

  return (
    <main className="grain grid min-h-screen place-items-center bg-[#eadbc8] px-4 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/70 bg-[#fffdf9] p-6 text-center soft-shadow sm:p-12">
        <div className="check-pop mx-auto grid h-20 w-20 place-items-center rounded-full border-[6px] border-[#f1dfc8] bg-[#9a5a27] text-white shadow-[0_18px_45px_rgba(154,90,39,.35)]"><Check size={39} strokeWidth={2.8} /></div>
        <div className="eyebrow mt-7 text-[#925326]">Order received • {orderId}</div>
        <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight sm:text-6xl">Thank you for your order!</h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-[#746052]">Your candle is one step closer. Our sales representative will call you soon to confirm your order.</p>

        <div className="mt-8 rounded-2xl border border-[#e6d7c6] bg-[#f8f0e5] p-5 text-left sm:p-6">
          <div className="flex justify-between gap-5 border-b border-[#e3d2bf] py-3 text-sm"><span className="text-[#7b6658]">Product ordered</span><span className="text-right font-extrabold">{product}</span></div>
          <div className="flex justify-between gap-5 border-b border-[#e3d2bf] py-3 text-sm"><span className="text-[#7b6658]">Quantity</span><span className="font-extrabold">{quantity}</span></div>
          <div className="flex justify-between gap-5 border-b border-[#e3d2bf] py-3 text-sm"><span className="text-[#7b6658]">Payment method</span><span className="font-extrabold">Cash On Delivery</span></div>
          <div className="flex items-end justify-between gap-5 pt-4"><span className="font-extrabold">Total price</span><span className="price-figures text-3xl font-extrabold">{formatNpr(total)}</span></div>
        </div>

        <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-[#eadfd2] p-4 text-sm"><Mail className="text-[#9e5c2d]" size={20} /><span>Check your email for the order receipt.</span></div>
          <div className="flex items-center gap-3 rounded-xl border border-[#eadfd2] p-4 text-sm"><PhoneCall className="text-[#9e5c2d]" size={20} /><span>Keep your phone nearby for confirmation.</span></div>
        </div>
        <Link href="/" className="btn-primary mt-8"><Home size={18} /> Back to home</Link>
      </div>
    </main>
  );
}
