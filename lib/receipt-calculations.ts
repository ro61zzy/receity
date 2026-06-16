import type { ReceiptItem, ReceiptTotals } from "@/types/receipt";

export function calculateItemTotal(item: ReceiptItem): number {
  return item.quantity * item.unitPrice;
}

export function calculateTotals(items: ReceiptItem[]): ReceiptTotals {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemTotal(item),
    0,
  );
  return { subtotal, total: subtotal };
}
