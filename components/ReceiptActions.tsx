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

type ReceiptActionsProps = {
  compact?: boolean;
};

export function ReceiptActions({ compact = false }: ReceiptActionsProps) {
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
      toast.success("✓ PDF downloaded successfully");
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
      toast.success("✓ Receipt saved — print dialog opened");
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
      toast.success("✓ Receipt saved — WhatsApp opened");
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
    toast.success("✓ New receipt ready");
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={handleWhatsApp}
          disabled={isExporting}
          className="h-11 bg-success text-success-foreground hover:bg-success/90"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          {isExporting ? "..." : "WhatsApp"}
        </Button>
        <Button
          onClick={handleDownloadPdf}
          disabled={isExporting}
          variant="outline"
          className="h-11"
        >
          <Download className="mr-2 h-4 w-4" />
          PDF
        </Button>
        <Button
          variant="outline"
          onClick={handlePrint}
          className="h-11"
        >
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
        <Button variant="secondary" onClick={handleNewReceipt} className="h-11">
          <Plus className="mr-2 h-4 w-4" />
          New
        </Button>
      </div>
    );
  }

  return (
    <Card className="receity-card">
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
            className="h-11 flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Generating..." : "Download PDF"}
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="h-11 flex-1"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleWhatsApp}
            disabled={isExporting}
            className="h-11 flex-1 bg-success text-success-foreground hover:bg-success/90"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            {isExporting ? "Preparing..." : "Send via WhatsApp"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleNewReceipt}
            className="h-11 flex-1"
          >
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
