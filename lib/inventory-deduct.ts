import { calculateItemTotal } from "@/lib/receipt-calculations";
import type { Product } from "@/types/inventory";
import type { ReceiptDetails } from "@/types/receipt";

export interface DeductStockResult {
  deducted: boolean;
  adjustments: { productId: string; label: string; from: number; to: number }[];
  warnings: string[];
}

export function deductStockForReceipt(
  receipt: ReceiptDetails,
  products: Product[],
  alreadyDeducted: boolean,
): { products: Product[]; result: DeductStockResult } {
  if (alreadyDeducted) {
    return {
      products,
      result: { deducted: false, adjustments: [], warnings: [] },
    };
  }

  const linkedItems = receipt.items.filter(
    (item) => item.productId && item.name.trim() && item.quantity > 0,
  );

  if (linkedItems.length === 0) {
    return {
      products,
      result: { deducted: false, adjustments: [], warnings: [] },
    };
  }

  const warnings: string[] = [];
  const adjustments: DeductStockResult["adjustments"] = [];
  const updated = products.map((p) => ({ ...p }));

  for (const item of linkedItems) {
    const index = updated.findIndex((p) => p.id === item.productId);
    if (index === -1) continue;

    const product = updated[index];
    const from = product.stock;
    const to = from - item.quantity;

    if (to < 0) {
      warnings.push(
        `${product.size} ${product.color}: only ${from} left, sold ${item.quantity}`,
      );
    }

    updated[index] = { ...product, stock: Math.max(0, to) };
    adjustments.push({
      productId: product.id,
      label: `${product.size} ${product.color}`,
      from,
      to: Math.max(0, to),
    });
  }

  return {
    products: updated,
    result: {
      deducted: adjustments.length > 0,
      adjustments,
      warnings,
    },
  };
}

export function getReceiptStockSummary(receipt: ReceiptDetails): string {
  const lines = receipt.items
    .filter((item) => item.productId && item.name.trim())
    .map((item) => {
      const total = calculateItemTotal(item);
      return `• ${item.name} × ${item.quantity} — KES ${total.toLocaleString()}`;
    });

  return lines.join("\n");
}
