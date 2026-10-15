"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images }: { images: readonly string[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setActive((value) => (value + 1) % images.length), 5500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  const move = (step: number) => setActive((value) => (value + step + images.length) % images.length);

  return (
    <div>
      <div className="group relative aspect-[4/4.2] max-h-[610px] overflow-hidden rounded-[2rem] bg-[#ead8c3] product-shadow">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Arinz Sandalwood Scented Candle product view ${index + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-all duration-700 ease-out ${index === active ? "scale-100 opacity-100 group-hover:scale-[1.08]" : "scale-100 opacity-0"}`}
            priority={index === 0}
          />
        ))}
        <button onClick={() => move(-1)} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow-md backdrop-blur hover:bg-white" aria-label="Previous image"><ChevronLeft /></button>
        <button onClick={() => move(1)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 shadow-md backdrop-blur hover:bg-white" aria-label="Next image"><ChevronRight /></button>
      </div>
      <div className="mt-4 grid grid-cols-5 gap-2.5">
        {images.map((src, index) => (
          <button key={src} onClick={() => setActive(index)} className={`group/thumb relative aspect-[5/4] overflow-hidden rounded-xl border-2 ${index === active ? "border-[#8f4f27]" : "border-transparent opacity-70 hover:opacity-100"}`} aria-label={`View product image ${index + 1}`} aria-current={index === active}>
            <Image src={src} alt="" fill sizes="110px" className="object-cover transition-transform duration-300 group-hover/thumb:scale-110" />
          </button>
        ))}
      </div>
    </div>
  );
}
