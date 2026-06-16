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
}

export interface ReceiptDetails {
  receiptNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  items: ReceiptItem[];
}

export interface SavedReceipt extends ReceiptDetails {
  id: string;
  createdAt: string;
  subtotal: number;
  total: number;
}

export interface ReceiptTotals {
  subtotal: number;
  total: number;
}
