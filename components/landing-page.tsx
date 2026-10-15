"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Clock3, Gift, Heart, Leaf, PackageCheck, ShieldCheck, Sparkles, Star, Truck } from "lucide-react";
import { PRODUCT, formatNpr, type DeliveryZone } from "@/lib/product";
import { SiteHeader } from "@/components/site-header";
import { ProductGallery } from "@/components/product-gallery";
import { OrderConfigurator } from "@/components/order-configurator";
import { BrandLogo } from "@/components/brand-logo";

const benefits = [
  { icon: Heart, title: "A calmer mood", text: "The warm, woody character of sandalwood helps set the tone for slower evenings." },
  { icon: Sparkles, title: "Instant atmosphere", text: "One gentle glow makes bedrooms, reading corners and quiet spaces feel more inviting." },
  { icon: Leaf, title: "An elegant aroma", text: "A grounded fragrance profile that feels refined, comforting and never overly sweet." },
  { icon: Gift, title: "Ready to gift", text: "A thoughtful choice for birthdays, housewarmings, thank-yous or a little self-care." },
];

const testimonials = [
  { name: "Aarati Shrestha", place: "Kathmandu", image: "/images/testimonials/aarati-shrestha.png", quote: "The kind of warm sandalwood scent I would want beside me while reading at night." },
  { name: "Prakriti Rai", place: "Dharan", image: "/images/testimonials/prakriti-rai.png", quote: "The amber jar looks beautiful and the overall feel is calm, minimal and gift-worthy." },
  { name: "Samiksha Gurung", place: "Pokhara", image: "/images/testimonials/samiksha-gurung.png", quote: "A lovely concept for winding down after a busy day without making the room feel too heavy." },
];

const trustItems = [
  [ShieldCheck, "Cash on Delivery", "Pay at your door"],
  [Truck, "Across Nepal", "Simple flat delivery"],
  [Clock3, "Fast dispatch", "Delivery in 2–3 days"],
  [PackageCheck, "Human support", "Call confirmation"],
] as const;

const faqs = [
  ["What does the candle smell like?", "It has a warm, rich and woody sandalwood profile designed to make your space feel calm and inviting."],
  ["Do you deliver throughout Nepal?", "Yes. Delivery is available across Nepal: NPR 100 inside Kathmandu Valley and NPR 150 outside the Valley."],
  ["How long does delivery take?", "Orders are usually delivered within 2–3 days after phone confirmation, depending on your location."],
  ["How do I pay?", "This product is Cash on Delivery. No online or advance payment is required."],
  ["What happens after I order?", "You will receive an order email, and our sales representative will call you soon to confirm your details."],
  ["Is this candle suitable as a gift?", "Yes. Its elegant amber presentation and universally warm scent make it a lovely gift for many occasions."],
];

export function LandingPage() {
  const [quantity, setQuantity] = useState(1);
  const [zone, setZone] = useState<DeliveryZone>("kathmandu");
  const checkoutHref = `/checkout?quantity=${quantity}&zone=${zone}`;

  return (
    <main className="overflow-hidden">
      <section className="grain relative bg-[#eadbc8] pt-24">
        <SiteHeader />
        <div className="absolute -left-24 top-44 h-64 w-64 rounded-full bg-[#c9864c]/20 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 pb-10 pt-5 lg:min-h-[600px] lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-9 lg:pt-3">
          <div className="relative z-10 max-w-2xl">
            <div className="eyebrow mb-4 flex items-center gap-2 text-[#84502d]"><span className="h-px w-8 bg-[#a4602f]" /> Sandalwood ritual • Cash on delivery</div>
            <h1 className="font-display text-[3.4rem] font-semibold leading-[.9] tracking-[-.04em] sm:text-7xl lg:text-[5.3rem]">Let the day melt <em className="font-medium text-[#a45b28]">away.</em></h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#664e40] sm:text-lg">Create a warm, calming atmosphere with the rich, woody aroma of the Arinz Sandalwood Scented Candle—your invitation to pause, breathe and enjoy the moment.</p>
            <div className="mt-5 flex items-end gap-3">
              <span className="price-figures text-3xl font-extrabold text-[#352018]">{formatNpr(PRODUCT.offerPrice)}</span>
              <span className="price-figures pb-1 text-base font-bold text-[#7d6659] line-through">{formatNpr(PRODUCT.regularPrice)}</span>
              <span className="mb-1 rounded-full bg-white/65 px-2.5 py-1 text-xs font-extrabold text-[#8c4c20]">SAVE NPR 200</span>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link href={checkoutHref} className="btn-primary">Purchase now <ArrowRight size={18} /></Link>
              <a href="#discover" className="btn-secondary">Explore the candle</a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold text-[#624a3c]">
              <span className="flex items-center gap-2"><PackageCheck size={17} /> Pay on delivery</span>
              <span className="flex items-center gap-2"><Truck size={17} /> All over Nepal</span>
              <span className="flex items-center gap-2"><Clock3 size={17} /> 2–3 day delivery</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:max-w-[500px] lg:justify-self-end">
            <div className="absolute -inset-4 rounded-[3rem] border border-white/40" />
            <div className="relative aspect-[4/4.25] max-h-[530px] overflow-hidden rounded-t-[8rem] rounded-b-[2rem] product-shadow gentle-float">
              <Image src={PRODUCT.images[3]} alt="Arinz Sandalwood Scented Candle with gift box" fill priority loading="eager" sizes="(max-width: 1024px) 90vw, 45vw" className="object-cover" />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl border border-white/25 bg-[#2d1a12]/80 p-3.5 text-white backdrop-blur-md">
                <div><div className="text-[10px] uppercase tracking-[.16em] text-[#e5c8a5]">Limited offer</div><div className="price-figures mt-1 text-2xl font-extrabold">{formatNpr(PRODUCT.offerPrice)}</div></div>
                <div className="text-right"><div className="price-figures text-xs font-bold text-white/65 line-through">{formatNpr(PRODUCT.regularPrice)}</div><div className="mt-1 rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-[#64371c]">Save NPR 200</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y border-[#eadfd2] bg-[#fffaf3]" aria-label="Ordering benefits">
        <div className="marquee-track">
          {[...trustItems, ...trustItems].map(([Icon, title, text], index) => {
            const TrustIcon = Icon as typeof ShieldCheck;
            return <div key={`${title}-${index}`} className="flex min-w-[270px] items-center gap-3 border-r border-[#eadfd2] px-8 py-4"><TrustIcon className="shrink-0 text-[#a15b2c]" size={22} /><div><div className="text-sm font-extrabold">{title}</div><div className="mt-0.5 text-xs text-[#846e61]">{text}</div></div></div>;
          })}
        </div>
      </section>

      <section id="discover" className="bg-[#fffdf9] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-2 lg:items-start lg:gap-14 lg:px-8">
          <ProductGallery images={PRODUCT.images} />
          <div className="lg:sticky lg:top-8">
            <div className="eyebrow text-[#9a5a2b]">A quiet luxury for your space</div>
            <h2 className="font-display mt-3 text-4xl font-semibold leading-[.95] tracking-tight sm:text-5xl">Arinz Sandalwood Scented Candle</h2>
            <p className="mt-4 leading-7 text-[#735d50]">{PRODUCT.description}</p>
            <ul className="my-5 grid gap-2.5 text-sm font-semibold sm:grid-cols-2">
              {["Calm, relaxing mood", "Warm, woody fragrance", "Beautiful gift idea", "Made for quiet evenings"].map((item) => <li key={item} className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#eee0cc]"><Check size={14} /></span>{item}</li>)}
            </ul>
            <OrderConfigurator quantity={quantity} setQuantity={setQuantity} zone={zone} setZone={setZone} />
          </div>
        </div>
      </section>

      <section className="grain bg-[#321e14] py-24 text-[#fff8ee] sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl"><div className="eyebrow text-[#d5a97f]">Why you’ll love it</div><h2 className="font-display mt-4 text-5xl font-semibold leading-none sm:text-6xl">A small flame. A softer room.</h2></div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] bg-white/12 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, text }) => <article key={title} className="bg-[#3a2419] p-7 sm:p-8"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e7c59e]/12 text-[#e5b982]"><Icon size={23} strokeWidth={1.6} /></div><h3 className="font-display mt-8 text-3xl font-semibold">{title}</h3><p className="mt-3 text-sm leading-7 text-[#cfbfb4]">{text}</p></article>)}
          </div>
          <div className="mt-12 text-center"><Link href={checkoutHref} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#f4e8d7] px-6 font-extrabold text-[#342016] hover:-translate-y-0.5 hover:bg-white">Buy now <ArrowRight size={17} /></Link></div>
        </div>
      </section>

      <section className="bg-[#f3e8d9] py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mx-auto max-w-2xl text-center"><div className="eyebrow text-[#95572c]">Illustrative customer stories</div><h2 className="font-display mt-4 text-5xl font-semibold sm:text-6xl">Made for moments like these</h2></div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => <article key={item.name} className="rounded-[1.75rem] border border-white/70 bg-white/65 p-7 shadow-sm"><div className="flex items-center justify-between gap-4"><Image src={item.image} alt={`Illustrative portrait for ${item.name}`} width={64} height={64} className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md" /><div className="flex gap-1 text-[#a7622d]">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={15} fill="currentColor" />)}</div></div><blockquote className="font-display mt-6 text-2xl font-semibold leading-snug">“{item.quote}”</blockquote><div className="mt-7 border-t border-[#e3d4c3] pt-5"><div className="font-extrabold">{item.name}</div><div className="text-sm text-[#806b5e]">{item.place}</div></div></article>)}
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf9] py-24 sm:py-32">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[.72fr_1.28fr] lg:px-8">
          <div><div className="eyebrow text-[#97582b]">Good to know</div><h2 className="font-display mt-4 text-5xl font-semibold sm:text-6xl">Your questions, answered.</h2><p className="mt-5 leading-7 text-[#7c6659]">Everything you need to know before placing your Cash on Delivery order.</p></div>
          <div className="divide-y divide-[#e8dbcd] border-y border-[#e8dbcd]">
            {faqs.map(([question, answer]) => <details key={question} className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-extrabold"><span>{question}</span><span className="text-2xl font-light transition-transform group-open:rotate-45">+</span></summary><p className="max-w-2xl pb-6 pr-8 text-sm leading-7 text-[#786357]">{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#dcb990] px-5 py-24 sm:py-28">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="relative mx-auto max-w-4xl text-center"><div className="eyebrow text-[#79451f]">Light it. Relax. Enjoy the moment.</div><h2 className="font-display mt-5 text-5xl font-semibold leading-none sm:text-7xl">Bring the warmth home.</h2><p className="mx-auto mt-6 max-w-xl leading-7 text-[#68452d]">Order today for <span className="price-figures font-bold">{formatNpr(PRODUCT.offerPrice)}</span>. Cash on Delivery is available throughout Nepal.</p><Link href={checkoutHref} className="btn-primary mt-8">Order your candle <ArrowRight size={18} /></Link></div>
      </section>

      <footer className="bg-[#25160f] px-5 py-9 text-[#d8c6b8]"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-sm sm:flex-row sm:items-center"><BrandLogo light className="h-auto w-[230px]" /><div className="flex flex-wrap items-center gap-5"><span>Cash on Delivery across Nepal</span><a href="mailto:sherine4moktan@gmail.com" className="font-bold text-[#f3dfc8] hover:text-white">sherine4moktan@gmail.com</a></div></div></footer>

      <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-white/30 bg-[#2d1a12]/95 p-2.5 shadow-2xl backdrop-blur md:hidden"><Link href={checkoutHref} className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#f7ead7] font-extrabold text-[#2d1a12]">Order now — <span className="price-figures">{formatNpr(PRODUCT.offerPrice * quantity + PRODUCT.deliveryFees[zone])}</span> <ArrowRight size={17} /></Link></div>
    </main>
  );
}
