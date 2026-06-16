"use client";

import { useState } from "react";
import { Download, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { downloadReceiptPdf, printReceipt } from "@/lib/pdf";
import { getReceiptPdfFilename } from "@/lib/receipt-filename";
import { useReceiptStore } from "@/lib/store/receipt-store";

export function ReceiptActions() {
  const receipt = useReceiptStore((state) => state.receipt);
  const newReceipt = useReceiptStore((state) => state.newReceipt);
  const saveCurrentReceipt = useReceiptStore((state) => state.saveCurrentReceipt);
  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPdf = async () => {
    const element = document.getElementById("receipt-preview");
    if (!element) {
      toast.error("Receipt preview not found");
      return;
    }

    setIsExporting(true);
    try {
      const filename = getReceiptPdfFilename(
        receipt.customerName,
        receipt.receiptNumber,
      );
      await downloadReceiptPdf(element, filename);
      saveCurrentReceipt();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate PDF",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    const element = document.getElementById("receipt-preview");
    if (!element) {
      toast.error("Receipt preview not found");
      return;
    }

    try {
      printReceipt(element);
      saveCurrentReceipt();
      toast.success("Print dialog opened");
    } catch (error) {
      console.error("Print failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to open print dialog",
      );
    }
  };

  const handleNewReceipt = () => {
    saveCurrentReceipt();
    newReceipt();
    toast.success("New receipt created");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
        <CardDescription>Export, print, or start a new receipt</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? "Generating..." : "Download PDF"}
        </Button>
        <Button variant="outline" onClick={handlePrint} className="flex-1">
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
        <Button variant="secondary" onClick={handleNewReceipt} className="flex-1">
          <Plus className="mr-2 h-4 w-4" />
          New Receipt
        </Button>
      </CardContent>
    </Card>
  );
}
