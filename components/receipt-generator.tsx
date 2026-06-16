"use client";

import { BusinessInfoCard } from "@/components/BusinessInfoCard";
import { CustomerInfoCard } from "@/components/CustomerInfoCard";
import { ItemsTable } from "@/components/ItemsTable";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { TotalsCard } from "@/components/TotalsCard";
import { ReceiptActions } from "@/components/ReceiptActions";
import { AppHeader } from "@/components/app-header";

export function ReceiptGenerator() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Create a Receipt
          </h2>
          <p className="mt-1 text-muted-foreground">
            Fill in your business and customer details. Preview updates live as
            you type.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="space-y-6">
            <BusinessInfoCard />
            <CustomerInfoCard />
            <ItemsTable />
            <TotalsCard />
            <ReceiptActions />
          </div>

          <div className="lg:sticky lg:top-20 lg:self-start">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              Live Preview
            </p>
            <ReceiptPreview />
          </div>
        </div>
      </main>
    </div>
  );
}
