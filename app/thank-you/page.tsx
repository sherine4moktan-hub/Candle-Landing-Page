import { Suspense } from "react";
import { ThankYouContent } from "@/components/thank-you-content";

export default function ThankYouPage() {
  return <Suspense fallback={<div className="min-h-screen bg-[#eadbc8]" />}><ThankYouContent /></Suspense>;
}
