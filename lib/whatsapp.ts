import { BUSINESS_SLOGAN } from "@/lib/constants";
import { formatCurrency } from "@/lib/currency";
import { calculateItemTotal, calculateTotals } from "@/lib/receipt-calculations";
import type { BusinessInfo } from "@/types/receipt";
import type { ReceiptDetails } from "@/types/receipt";

/** Normalize a Kenyan phone number for wa.me links */
export function normalizeWhatsAppPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("254")) return digits;
  if (digits.startsWith("0")) return `254${digits.slice(1)}`;
  if (digits.length === 9) return `254${digits}`;
  return digits;
}

export function formatReceiptWhatsAppMessage(
  receipt: ReceiptDetails,
  business: BusinessInfo,
): string {
  const { total } = calculateTotals(receipt.items);
  const customer = receipt.customerName.trim() || "there";

  const itemLines = receipt.items
    .filter((item) => item.name.trim())
    .map(
      (item) =>
        `• ${item.name} × ${item.quantity} — ${formatCurrency(calculateItemTotal(item))}`,
    )
    .join("\n");

  const date = new Date(receipt.date + "T00:00:00").toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return [
    `Hi ${customer}!`,
    "",
    `Thank you for shopping with ${business.name || "us"}!`,
    "",
    `Receipt: ${receipt.receiptNumber}`,
    `Date: ${date}`,
    `Payment: ${receipt.paymentMethod}`,
    "",
    itemLines || "- (No items listed)",
    "",
    `Total: ${formatCurrency(total)}`,
    "",
    BUSINESS_SLOGAN,
    "",
    business.name || "Receity",
  ].join("\n");
}

/** Free — opens WhatsApp app/web with a pre-filled receipt message (no API needed) */
export function buildWhatsAppReceiptUrl(
  phone: string,
  message: string,
): string {
  const normalized = normalizeWhatsAppPhone(phone);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

/** Free — opens WhatsApp app/web with a pre-filled receipt message */
export function openWhatsAppReceipt(
  phone: string,
  receipt: ReceiptDetails,
  business: BusinessInfo,
  targetWindow?: Window | null,
): void {
  if (!phone.trim()) {
    throw new Error("Add a customer phone number first");
  }

  const message = formatReceiptWhatsAppMessage(receipt, business);
  const url = buildWhatsAppReceiptUrl(phone, message);
  openWhatsAppUrl(url, targetWindow);
}

/** Open wa.me without losing the Receity tab (popup must be opened on click) */
export function openWhatsAppUrl(url: string, targetWindow?: Window | null): void {
  if (targetWindow && !targetWindow.closed) {
    targetWindow.location.href = url;
    return;
  }

  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(url);
  }
}
