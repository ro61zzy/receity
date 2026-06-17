"use client";

import { AppHeader } from "@/components/app-header";
import { ReceiptHistoryList } from "@/components/receipt-history-list";
import { ReceiptHistoryStats } from "@/components/receipt-history-stats";
import { SetupNotice } from "@/components/setup-notice";
import { useReceiptStore } from "@/lib/store/receipt-store";

export function ReceiptHistoryManager() {
  const savedReceipts = useReceiptStore((state) => state.savedReceipts);

  return (
    <div className="receity-page-bg min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <AppHeader />
      <SetupNotice />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Receipt History
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Search past receipts, re-download PDFs, or duplicate into a new
            receipt.
          </p>
        </div>

        <div className="space-y-6">
          <ReceiptHistoryStats receipts={savedReceipts} />
          <ReceiptHistoryList />
        </div>
      </main>
    </div>
  );
}
