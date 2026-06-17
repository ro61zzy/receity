"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Download,
  Eye,
  History,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReceiptPreview } from "@/components/ReceiptPreview";
import { ReceiptViewSheet } from "@/components/receipt-view-sheet";
import { formatCurrency } from "@/lib/currency";
import {
  filterReceipts,
  formatReceiptDate,
  sortReceiptsNewestFirst,
} from "@/lib/receipt-history";
import { downloadReceiptPdf } from "@/lib/pdf";
import { getReceiptPdfFilename } from "@/lib/receipt-filename";
import { useReceiptStore } from "@/lib/store/receipt-store";
import type { SavedReceipt } from "@/types/receipt";

export function ReceiptHistoryList() {
  const router = useRouter();
  const savedReceipts = useReceiptStore((state) => state.savedReceipts);
  const business = useReceiptStore((state) => state.business);
  const deleteSavedReceipt = useReceiptStore((state) => state.deleteSavedReceipt);
  const duplicateSavedReceipt = useReceiptStore(
    (state) => state.duplicateSavedReceipt,
  );

  const [search, setSearch] = useState("");
  const [viewReceipt, setViewReceipt] = useState<SavedReceipt | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredReceipts = useMemo(() => {
    const sorted = sortReceiptsNewestFirst(savedReceipts);
    return filterReceipts(sorted, search);
  }, [savedReceipts, search]);

  const exportingReceipt = savedReceipts.find(
    (receipt) => receipt.id === exportingId,
  );

  const handleDownload = async (receipt: SavedReceipt) => {
    setExportingId(receipt.id);
    setDownloadingId(receipt.id);

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const element = document.getElementById(`receipt-export-${receipt.id}`);
      if (!element) {
        throw new Error("Receipt preview not found");
      }

      const filename = getReceiptPdfFilename(
        receipt.customerName,
        receipt.receiptNumber,
      );
      await downloadReceiptPdf(element, filename);
      toast.success("PDF downloaded");
    } catch (error) {
      console.error("PDF download failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to download PDF",
      );
    } finally {
      setExportingId(null);
      setDownloadingId(null);
    }
  };

  const handleDuplicate = (receipt: SavedReceipt) => {
    duplicateSavedReceipt(receipt.id);
    toast.success("Receipt loaded — edit and save as new");
    router.push("/");
  };

  const handleDelete = (receipt: SavedReceipt) => {
    const confirmed = window.confirm(
      `Delete receipt ${receipt.receiptNumber}? This cannot be undone.`,
    );
    if (!confirmed) return;

    deleteSavedReceipt(receipt.id);
    if (viewReceipt?.id === receipt.id) {
      setViewReceipt(null);
    }
    toast.success("Receipt deleted");
  };

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">All Receipts</CardTitle>
            <CardDescription>
              {filteredReceipts.length} receipt
              {filteredReceipts.length === 1 ? "" : "s"}
              {search.trim() ? " matching search" : ""}
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search number, name, phone..."
              className="pl-8"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {filteredReceipts.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <History className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {savedReceipts.length === 0
                    ? "No receipts saved yet"
                    : "No matching receipts"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {savedReceipts.length === 0
                    ? "Complete a receipt to see it here."
                    : "Try a different search term."}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Receipt Number</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="font-mono text-sm">
                          {receipt.receiptNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {receipt.customerName || "—"}
                            </p>
                            {receipt.customerPhone && (
                              <p className="text-xs text-muted-foreground">
                                {receipt.customerPhone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatReceiptDate(receipt.date)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{receipt.paymentMethod}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(receipt.total)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setViewReceipt(receipt)}
                              aria-label="View receipt"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDownload(receipt)}
                              disabled={downloadingId === receipt.id}
                              aria-label="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDuplicate(receipt)}
                              aria-label="Duplicate receipt"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDelete(receipt)}
                              aria-label="Delete receipt"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {filteredReceipts.map((receipt) => (
                  <Card key={receipt.id} className="shadow-sm">
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-sm font-medium">
                            {receipt.receiptNumber}
                          </p>
                          <p className="mt-1 font-medium">
                            {receipt.customerName || "Walk-in customer"}
                          </p>
                          {receipt.customerPhone && (
                            <p className="text-sm text-muted-foreground">
                              {receipt.customerPhone}
                            </p>
                          )}
                        </div>
                        <p className="text-right font-semibold">
                          {formatCurrency(receipt.total)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatReceiptDate(receipt.date)}</span>
                        <Badge variant="secondary">{receipt.paymentMethod}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10"
                          onClick={() => setViewReceipt(receipt)}
                        >
                          <Eye className="mr-1.5 h-4 w-4" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10"
                          onClick={() => handleDownload(receipt)}
                          disabled={downloadingId === receipt.id}
                        >
                          <Download className="mr-1.5 h-4 w-4" />
                          {downloadingId === receipt.id ? "Saving..." : "PDF"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10"
                          onClick={() => handleDuplicate(receipt)}
                        >
                          <Copy className="mr-1.5 h-4 w-4" />
                          Duplicate
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-10 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(receipt)}
                        >
                          <Trash2 className="mr-1.5 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ReceiptViewSheet
        receipt={viewReceipt}
        business={business}
        onClose={() => setViewReceipt(null)}
      />

      {exportingReceipt && (
        <div
          className="pointer-events-none fixed -left-[9999px] top-0 opacity-0"
          aria-hidden
        >
          <ReceiptPreview
            receipt={exportingReceipt}
            business={business}
            totals={{
              subtotal: exportingReceipt.subtotal,
              total: exportingReceipt.total,
            }}
            previewId={`receipt-export-${exportingReceipt.id}`}
          />
        </div>
      )}
    </>
  );
}
