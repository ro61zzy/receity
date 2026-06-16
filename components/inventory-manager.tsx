"use client";

import { AppHeader } from "@/components/app-header";
import { InventoryTable } from "@/components/InventoryTable";

export function InventoryManager() {
  return (
    <div className="min-h-screen bg-muted/30">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
          <p className="mt-1 text-muted-foreground">
            Track stock by size and color. When you complete a receipt, linked
            items deduct automatically.
          </p>
        </div>

        <InventoryTable />
      </main>
    </div>
  );
}
