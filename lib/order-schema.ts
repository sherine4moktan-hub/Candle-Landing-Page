import { z } from "zod";

export const orderSchema = z.object({
  submissionId: z.string().uuid("Invalid submission identifier"),
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^(?:\+977[- ]?)?9[678]\d{8}$/, "Enter a valid Nepal mobile number"),
  email: z.string().trim().email("Enter a valid email address").max(160),
  location: z.string().trim().min(5, "Please share your exact location").max(300),
  productName: z.string().trim().min(1, "Product name is required"),
  quantity: z.coerce.number().int().min(1).max(10),
  pricePerPiece: z.coerce.number().positive(),
  deliveryZone: z.enum(["kathmandu", "outside"]),
  totalPrice: z.coerce.number().positive(),
});

export type OrderInput = z.infer<typeof orderSchema>;

export type SavedOrder = OrderInput & {
  orderId: string;
  createdAt: string;
  dateTime: string;
  deliveryFee: number;
  paymentMethod: "Cash On Delivery";
  orderStatus: "New Order";
  notes: "";
};
