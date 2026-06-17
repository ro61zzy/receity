"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReceiptViewSheet } from "@/components/receipt-view-sheet";
import { formatCurrency } from "@/lib/currency";
import { formatCustomerDate } from "@/lib/customer-utils";
import { formatReceiptDate } from "@/lib/receipt-history";
import { useCustomerStore } from "@/lib/store/customer-store";
import { useReceiptStore } from "@/lib/store/receipt-store";
import type { Customer } from "@/types/customer";
import type { SavedReceipt } from "@/types/receipt";

type CustomerDetailSheetProps = {
  customer: Customer | null;
  onClose: () => void;
};

export function CustomerDetailSheet({
  customer,
  onClose,
}: CustomerDetailSheetProps) {
  const business = useReceiptStore((state) => state.business);
  const savedReceipts = useReceiptStore((state) => state.savedReceipts);
  const bootstrapFromReceipts = useCustomerStore(
    (state) => state.bootstrapFromReceipts,
  );

  const [viewReceipt, setViewReceipt] = useState<SavedReceipt | null>(null);

  useEffect(() => {
    bootstrapFromReceipts(savedReceipts);
  }, [bootstrapFromReceipts, savedReceipts]);

  useEffect(() => {
    if (!customer) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [customer, onClose]);

  if (!customer) return null;

  const purchaseHistory = savedReceipts
    .filter((receipt) => customer.receiptIds.includes(receipt.id))
    .sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.createdAt.localeCompare(a.createdAt);
    });

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center">
        <button
          type="button"
          aria-label="Close customer details"
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        <div className="relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-2xl border bg-background shadow-lg sm:max-w-lg sm:rounded-2xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div>
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4 overflow-y-auto px-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Orders</p>
                <p className="mt-1 text-lg font-semibold">
                  {customer.purchaseCount}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Total spent</p>
                <p className="mt-1 text-lg font-semibold">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Last purchase</p>
              <p className="mt-1 font-medium">
                {formatCustomerDate(customer.lastPurchaseDate)}
              </p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Purchase history</p>
              {purchaseHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No linked receipts found.
                </p>
              ) : (
                <ul className="space-y-2">
                  {purchaseHistory.map((receipt) => (
                    <li key={receipt.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-3 text-left transition-colors hover:bg-muted/50"
                        onClick={() => setViewReceipt(receipt)}
                      >
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-medium">
                            {receipt.receiptNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatReceiptDate(receipt.date)}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="secondary">{receipt.paymentMethod}</Badge>
                          <span className="text-sm font-semibold">
                            {formatCurrency(receipt.total)}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReceiptViewSheet
        receipt={viewReceipt}
        business={business}
        onClose={() => setViewReceipt(null)}
      />
    </>
  );
}
