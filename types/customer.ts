export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  purchaseCount: number;
  lastPurchaseDate: string;
  receiptIds: string[];
  createdAt: string;
  updatedAt: string;
}
