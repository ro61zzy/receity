"use client";

import { useState } from "react";
import { Download, MessageCircle, Plus, Printer } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isDesktopLikeDevice } from "@/lib/device";
import { downloadReceiptPdf, printReceipt } from "@/lib/pdf";
import { getReceiptPdfFilename } from "@/lib/receipt-filename";
import { finalizeReceipt } from "@/lib/finalize-receipt";
import { openWhatsAppReceipt } from "@/lib/whatsapp";
import { useReceiptStore } from "@/lib/store/receipt-store";

export function ReceiptActions() {
  const receipt = useReceiptStore((state) => state.receipt);
  const business = useReceiptStore((state) => state.business);
  const newReceipt = useReceiptStore((state) => state.newReceipt);
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
      finalizeReceipt();
      toast.success("PDF downloaded — stock updated");
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
      finalizeReceipt();
      toast.success("Print dialog opened — stock updated");
    } catch (error) {
      console.error("Print failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to open print dialog",
      );
    }
  };

  const handleWhatsApp = async () => {
    const phone = receipt.customerPhone.trim() || business.whatsapp.trim();
    if (!phone) {
      toast.error("Add customer phone or business WhatsApp number");
      return;
    }

    const element = document.getElementById("receipt-preview");
    if (!element) {
      toast.error("Receipt preview not found");
      return;
    }

    // Pre-open tab on desktop (same click) so popup blockers don't block wa.me
    const whatsAppWindow = isDesktopLikeDevice()
      ? window.open("about:blank", "_blank")
      : null;

    setIsExporting(true);
    try {
      const filename = getReceiptPdfFilename(
        receipt.customerName,
        receipt.receiptNumber,
      );

      await downloadReceiptPdf(element, filename);
      await new Promise((resolve) => setTimeout(resolve, 400));
      openWhatsAppReceipt(phone, receipt, business, whatsAppWindow);
      finalizeReceipt();
      toast.success(
        "WhatsApp opened — attach the downloaded PDF, then send",
      );
    } catch (error) {
      whatsAppWindow?.close();
      console.error("WhatsApp send failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Could not open WhatsApp",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleNewReceipt = () => {
    finalizeReceipt();
    newReceipt();
    toast.success("New receipt created");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Actions</CardTitle>
        <CardDescription>
          Export, send via WhatsApp, or start a new receipt
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row">
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
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            disabled={isExporting}
            className="flex-1 border-green-600/30 text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950/30"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {isExporting ? "Preparing..." : "Send via WhatsApp"}
          </Button>
          <Button variant="secondary" onClick={handleNewReceipt} className="flex-1">
            <Plus className="mr-2 h-4 w-4" />
            New Receipt
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Downloads the PDF, then opens WhatsApp to the customer. Attach the PDF
          in chat before sending.
        </p>
      </CardContent>
    </Card>
  );
}
