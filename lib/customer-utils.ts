import { normalizePhone } from "@/lib/phone";
import type { Customer } from "@/types/customer";
import type { SavedReceipt } from "@/types/receipt";

export function formatCustomerDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function computeCustomerStats(
  receiptIds: string[],
  savedReceipts: SavedReceipt[],
): Pick<Customer, "totalSpent" | "purchaseCount" | "lastPurchaseDate"> {
  const linked = savedReceipts.filter((receipt) =>
    receiptIds.includes(receipt.id),
  );

  const totalSpent = linked.reduce((sum, receipt) => sum + receipt.total, 0);
  const purchaseCount = linked.length;
  const lastPurchaseDate = linked.reduce((latest, receipt) => {
    const date = receipt.date || receipt.createdAt.slice(0, 10);
    return date > latest ? date : latest;
  }, "");

  return { totalSpent, purchaseCount, lastPurchaseDate };
}

export function sortCustomersByActivity(customers: Customer[]): Customer[] {
  return [...customers].sort((a, b) => {
    const dateCompare = b.lastPurchaseDate.localeCompare(a.lastPurchaseDate);
    if (dateCompare !== 0) return dateCompare;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function filterCustomers(
  customers: Customer[],
  query: string,
): Customer[] {
  const q = query.trim().toLowerCase();
  if (!q) return customers;

  const phoneDigits = query.replace(/\D/g, "");

  return customers.filter((customer) => {
    if (customer.name.toLowerCase().includes(q)) return true;
    if (customer.phone.toLowerCase().includes(q)) return true;
    if (
      phoneDigits &&
      normalizePhone(customer.phone).includes(normalizePhone(phoneDigits))
    ) {
      return true;
    }
    return false;
  });
}

export function getRecentCustomers(
  customers: Customer[],
  limit = 5,
): Customer[] {
  return sortCustomersByActivity(customers).slice(0, limit);
}
