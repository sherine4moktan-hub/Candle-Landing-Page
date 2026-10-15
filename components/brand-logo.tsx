import Image from "next/image";
import Link from "next/link";

export function BrandLogo({
  light = false,
  className = "h-auto w-[190px]",
}: {
  light?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" aria-label="Arinz Candles home" className="inline-flex shrink-0">
      <Image
        src={light ? "/brand/arinz-logo-full-light.png" : "/brand/arinz-logo-full.png"}
        alt="Arinz Candles"
        width={1200}
        height={320}
        className={className}
        priority
      />
    </Link>
  );
}
