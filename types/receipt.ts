export interface BusinessInfo {
  logo: string | null;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  tiktok: string;
  instagram: string;
}

export interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  productId?: string;
}

export type PaymentMethod = "M-Pesa" | "Cash" | "Bank Transfer" | "Card";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "M-Pesa",
  "Cash",
  "Bank Transfer",
  "Card",
];

export interface ReceiptDetails {
  receiptNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: PaymentMethod;
  items: ReceiptItem[];
}

export interface SavedReceipt extends ReceiptDetails {
  id: string;
  createdAt: string;
  subtotal: number;
  total: number;
  stockDeducted?: boolean;
}

export interface ReceiptTotals {
  subtotal: number;
  total: number;
}
