import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <BrandLogo className="h-auto w-[168px] sm:w-[205px]" />
        <Link href="/checkout?quantity=1&zone=kathmandu" className="flex min-h-11 items-center gap-2 rounded-full bg-[#2d1a12] px-4 text-sm font-extrabold text-white shadow-lg hover:-translate-y-0.5 hover:bg-[#6b3c20] sm:px-5">
          Order now <ArrowRight size={16} />
        </Link>
      </div>
    </header>
  );
}
