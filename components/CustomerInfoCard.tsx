"use client";

import { Copy, User } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useReceiptStore } from "@/lib/store/receipt-store";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/receipt";

export function CustomerInfoCard() {
  const receipt = useReceiptStore((state) => state.receipt);
  const setReceipt = useReceiptStore((state) => state.setReceipt);

  const copyReceiptNumber = async () => {
    await navigator.clipboard.writeText(receipt.receiptNumber);
    toast.success("Receipt number copied");
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Receipt Details</CardTitle>
        </div>
        <CardDescription>Customer and receipt information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="receipt-number">Receipt Number</Label>
            <div className="flex gap-2">
              <Input
                id="receipt-number"
                value={receipt.receiptNumber}
                readOnly
                className="font-mono bg-muted/50"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={copyReceiptNumber}
                aria-label="Copy receipt number"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt-date">Date</Label>
            <Input
              id="receipt-date"
              type="date"
              value={receipt.date}
              onChange={(e) => setReceipt({ date: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Customer Name</Label>
            <Input
              id="customer-name"
              placeholder="John Doe"
              value={receipt.customerName}
              onChange={(e) => setReceipt({ customerName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Customer Phone</Label>
            <Input
              id="customer-phone"
              placeholder="+254 7XX XXX XXX"
              value={receipt.customerPhone}
              onChange={(e) => setReceipt({ customerPhone: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="payment-method">Payment Method</Label>
          <select
            id="payment-method"
            value={receipt.paymentMethod}
            onChange={(e) =>
              setReceipt({ paymentMethod: e.target.value as PaymentMethod })
            }
            className={cn(
              "border-input bg-background h-8 w-full rounded-lg border px-2.5 text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-3",
            )}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="served-by">Served By</Label>
            <Input
              id="served-by"
              placeholder="Staff name"
              value={receipt.servedBy}
              onChange={(e) => setReceipt({ servedBy: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="receipt-notes">Notes</Label>
          <textarea
            id="receipt-notes"
            placeholder="Optional notes for this receipt"
            value={receipt.notes}
            onChange={(e) => setReceipt({ notes: e.target.value })}
            rows={2}
            className={cn(
              "border-input bg-background w-full rounded-lg border px-2.5 py-2 text-sm",
              "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-3",
              "resize-none",
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}
