import { PAYMENT_METHODS, type PaymentMethod, type SavedReceipt } from "@/types/receipt";

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function sortReceiptsNewestFirst(receipts: SavedReceipt[]): SavedReceipt[] {
  return [...receipts].sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function filterReceipts(
  receipts: SavedReceipt[],
  query: string,
): SavedReceipt[] {
  const q = query.trim().toLowerCase();
  if (!q) return receipts;

  const phoneDigits = query.replace(/\D/g, "");

  return receipts.filter((receipt) => {
    if (receipt.receiptNumber.toLowerCase().includes(q)) return true;
    if (receipt.customerName.toLowerCase().includes(q)) return true;
    if (
      phoneDigits &&
      receipt.customerPhone.replace(/\D/g, "").includes(phoneDigits)
    ) {
      return true;
    }
    return false;
  });
}

export type TodayStats = {
  revenue: number;
  receiptCount: number;
  paymentBreakdown: Record<PaymentMethod, number>;
};

export function getTodayStats(receipts: SavedReceipt[]): TodayStats {
  const today = getTodayDateString();
  const todayReceipts = receipts.filter((receipt) => receipt.date === today);

  const paymentBreakdown = PAYMENT_METHODS.reduce(
    (acc, method) => {
      acc[method] = 0;
      return acc;
    },
    {} as Record<PaymentMethod, number>,
  );

  let revenue = 0;
  for (const receipt of todayReceipts) {
    revenue += receipt.total;
    paymentBreakdown[receipt.paymentMethod] += receipt.total;
  }

  return {
    revenue,
    receiptCount: todayReceipts.length,
    paymentBreakdown,
  };
}

export function formatReceiptDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
