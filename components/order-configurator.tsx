"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { PRODUCT, formatNpr, type DeliveryZone } from "@/lib/product";

export function OrderConfigurator({ quantity, setQuantity, zone, setZone }: {
  quantity: number;
  setQuantity: (value: number) => void;
  zone: DeliveryZone;
  setZone: (value: DeliveryZone) => void;
}) {
  const delivery = PRODUCT.deliveryFees[zone];
  const subtotal = PRODUCT.offerPrice * quantity;
  const total = subtotal + delivery;
  const href = `/checkout?quantity=${quantity}&zone=${zone}`;

  return (
    <div className="rounded-[1.5rem] border border-[#dfcdb8] bg-white/75 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex items-end justify-between gap-3 border-b border-[#eadfd2] pb-4">
        <div>
          <div className="mb-1 text-sm text-[#876f60]">Limited-time price</div>
          <div className="price-figures text-3xl font-extrabold">{formatNpr(PRODUCT.offerPrice)}</div>
        </div>
        <div className="text-right">
          <div className="price-figures text-sm font-semibold text-[#876f60] line-through">{formatNpr(PRODUCT.regularPrice)}</div>
          <div className="mt-1 rounded-full bg-[#efe0c8] px-3 py-1 text-xs font-extrabold text-[#824519]">SAVE NPR 200</div>
        </div>
      </div>

      <div className="grid gap-4 py-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-extrabold">Quantity</label>
          <div className="flex h-12 w-full items-center justify-between rounded-xl border border-[#ddcbb8] bg-white px-2">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#f5ede3]" aria-label="Decrease quantity"><Minus size={17} /></button>
            <span className="font-extrabold">{quantity}</span>
            <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-[#f5ede3]" aria-label="Increase quantity"><Plus size={17} /></button>
          </div>
        </div>
        <div>
          <label htmlFor="delivery-zone" className="mb-2 block text-sm font-extrabold">Delivery area</label>
          <select id="delivery-zone" value={zone} onChange={(event) => setZone(event.target.value as DeliveryZone)} className="field h-12 py-0 text-sm font-semibold">
            <option value="kathmandu">Inside Kathmandu Valley</option>
            <option value="outside">Outside Kathmandu Valley</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5 border-t border-[#eadfd2] pt-4 text-sm">
        <div className="flex justify-between text-[#8a7568]"><span>Regular subtotal</span><span className="price-figures line-through">{formatNpr(PRODUCT.regularPrice * quantity)}</span></div>
        <div className="flex justify-between font-bold text-[#67483a]"><span>Offer subtotal</span><span className="price-figures">{formatNpr(subtotal)}</span></div>
        <div className="flex justify-between text-[#9b5a2b]"><span>You save</span><span className="price-figures">− {formatNpr((PRODUCT.regularPrice - PRODUCT.offerPrice) * quantity)}</span></div>
        <div className="flex justify-between text-[#735f52]"><span>Delivery</span><span className="price-figures">{formatNpr(delivery)}</span></div>
        <div className="flex justify-between pt-1 text-lg font-extrabold"><span>Total</span><span className="price-figures">{formatNpr(total)}</span></div>
      </div>
      <Link href={href} className="btn-primary mt-4 w-full"><ShoppingBag size={18} /> Order now — <span className="price-figures">{formatNpr(total)}</span></Link>
      <p className="mt-2 text-center text-xs text-[#7b6659]">No advance payment. Pay when your order arrives.</p>
    </div>
  );
}
