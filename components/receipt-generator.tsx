"use client";

import { useState } from "react";
import { Eye, PencilLine } from "lucide-react";
import { BusinessInfoCard } from "@/components/BusinessInfoCard";
import { CustomerInfoCard } from "@/components/CustomerInfoCard";
import { ItemsTable } from "@/components/ItemsTable";
import { ReceiptPreviewFrame } from "@/components/receipt-preview-frame";
import { TotalsCard } from "@/components/TotalsCard";
import { ReceiptActions } from "@/components/ReceiptActions";
import { AppHeader } from "@/components/app-header";
import { SetupNotice } from "@/components/setup-notice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MobileView = "edit" | "preview";

export function ReceiptGenerator() {
  const [mobileView, setMobileView] = useState<MobileView>("edit");

  return (
    <div className="receity-page-bg min-h-screen pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <AppHeader />
      <SetupNotice />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8">
        <div className="mb-4 lg:mb-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Create a Receipt
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Fill in details below. Preview updates as you type.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2 lg:hidden">
          <Button
            type="button"
            variant={mobileView === "edit" ? "default" : "outline"}
            className="h-11"
            onClick={() => setMobileView("edit")}
          >
            <PencilLine className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant={mobileView === "preview" ? "default" : "outline"}
            className="h-11"
            onClick={() => setMobileView("preview")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-8">
          <div
            className={cn(
              "space-y-4 sm:space-y-6",
              mobileView === "preview" && "hidden lg:block",
            )}
          >
            <BusinessInfoCard />
            <CustomerInfoCard />
            <ItemsTable />
            <TotalsCard />
            <div className="hidden lg:block">
              <ReceiptActions />
            </div>
          </div>

          <div
            className={cn(
              "lg:sticky lg:top-20 lg:self-start",
              mobileView === "edit" && "hidden lg:block",
            )}
          >
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Live Preview
            </p>
            <ReceiptPreviewFrame />
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom,0px))] z-40 border-t bg-background/95 p-3 backdrop-blur-sm lg:hidden">
        <ReceiptActions compact />
      </div>
    </div>
  );
}
