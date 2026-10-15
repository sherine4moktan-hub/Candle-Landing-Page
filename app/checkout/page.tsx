import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#f2e7d8]" />}><CheckoutForm /></Suspense>;
}
