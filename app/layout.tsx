import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Arinz Sandalwood Scented Candle | Arinz Candles",
  description:
    "Bring home a calm, woody sandalwood ritual. Order your Arinz candle anywhere in Nepal with Cash on Delivery.",
  icons: {
    icon: [{ url: "/brand/arinz-logo-icon.png?v=2", type: "image/png", sizes: "512x512" }],
    apple: "/brand/arinz-logo-icon.png?v=2",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${display.variable} ${body.variable}`}>{children}</body>
    </html>
  );
}
