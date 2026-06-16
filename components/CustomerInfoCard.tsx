"use client";

import { User } from "lucide-react";
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
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { useReceiptStore } from "@/lib/store/receipt-store";

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
      </CardContent>
    </Card>
  );
}
