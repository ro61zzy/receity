"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { ReceiptPreviewFrame } from "@/components/receipt-preview-frame";
import type { BusinessInfo, SavedReceipt } from "@/types/receipt";

type ReceiptViewSheetProps = {
  receipt: SavedReceipt | null;
  business: BusinessInfo;
  onClose: () => void;
};

export function ReceiptViewSheet({
  receipt,
  business,
  onClose,
}: ReceiptViewSheetProps) {
  useEffect(() => {
    if (!receipt) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [receipt, onClose]);

  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center sm:justify-center">
      <button
        type="button"
        aria-label="Close receipt view"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      <div className="relative z-10 flex max-h-[92vh] w-full flex-col rounded-t-2xl border bg-background shadow-lg sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="font-semibold">{receipt.receiptNumber}</p>
            <p className="text-sm text-muted-foreground">
              {receipt.customerName || "Walk-in customer"}
            </p>
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

        <div className="overflow-y-auto px-4 py-4">
          <ReceiptPreviewFrame>
            <ReceiptPreview
              receipt={receipt}
              business={business}
              totals={{ subtotal: receipt.subtotal, total: receipt.total }}
              previewId={`receipt-view-${receipt.id}`}
            />
          </ReceiptPreviewFrame>
        </div>
      </div>
    </div>
  );
}
