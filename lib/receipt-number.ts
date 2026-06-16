import { RECEIPT_PREFIX } from "./constants";

export function getReceiptYear(date?: string | Date): number {
  if (date instanceof Date) return date.getFullYear();
  if (date) {
    const parsed = new Date(date.includes("T") ? date : `${date}T00:00:00`);
    if (!Number.isNaN(parsed.getTime())) return parsed.getFullYear();
  }
  return new Date().getFullYear();
}

export function formatReceiptNumber(counter: number, year?: number): string {
  const receiptYear = year ?? getReceiptYear();
  return `${RECEIPT_PREFIX}-${receiptYear}-${String(counter).padStart(4, "0")}`;
}

export function getNextReceiptNumber(
  currentCounter: number,
  year?: number,
): {
  number: string;
  nextCounter: number;
  year: number;
} {
  const receiptYear = year ?? getReceiptYear();
  const nextCounter = currentCounter + 1;
  return {
    number: formatReceiptNumber(nextCounter, receiptYear),
    nextCounter,
    year: receiptYear,
  };
}
