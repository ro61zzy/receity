"use client";

import { AppHeader } from "@/components/app-header";
import { CustomerList } from "@/components/customer-list";
import { SetupNotice } from "@/components/setup-notice";

export function CustomerManager() {
  return (
    <div className="receity-page-bg min-h-screen pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <AppHeader />
      <SetupNotice />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Customers
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Your customer list builds automatically from completed receipts.
          </p>
        </div>

        <CustomerList />
      </main>
    </div>
  );
}
