export interface Product {
  id: string;
  name: string;
  category: string;
  size: string;
  color: string;
  stock: number;
  unitPrice: number;
  lowStockThreshold: number;
}

export interface StockAdjustment {
  productId: string;
  receiptNumber: string;
  quantity: number;
  date: string;
}
