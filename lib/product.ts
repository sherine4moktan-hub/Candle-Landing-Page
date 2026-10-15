export const PRODUCT = {
  name: "Arinz Sandalwood Scented Candle",
  shortName: "Sandalwood Scented Candle",
  regularPrice: 999,
  offerPrice: 799,
  currency: "NPR",
  deliveryFees: {
    kathmandu: 100,
    outside: 150,
  },
  images: [
    "/images/arinz-sandalwood-1.png",
    "/images/arinz-sandalwood-2.png",
    "/images/arinz-sandalwood-3.png",
    "/images/arinz-sandalwood-4.png",
    "/images/arinz-sandalwood-5.png",
  ],
  description:
    "Create a warm, calming atmosphere with the rich, woody aroma of sandalwood—made for relaxing evenings, self-care moments and quiet rituals.",
} as const;

export type DeliveryZone = keyof typeof PRODUCT.deliveryFees;

export function formatNpr(amount: number) {
  return `NPR ${new Intl.NumberFormat("en-NP").format(amount)}`;
}

export function getDeliveryLabel(zone: DeliveryZone) {
  return zone === "kathmandu"
    ? "Inside Kathmandu Valley"
    : "Outside Kathmandu Valley";
}
