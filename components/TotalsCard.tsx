"use client";

import { Receipt } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency";
import { useReceiptStore, useReceiptTotals } from "@/lib/store/receipt-store";
import { PAYMENT_METHODS, type PaymentMethod } from "@/types/receipt";

export function TotalsCard() {
  const receipt = useReceiptStore((state) => state.receipt);
  const setReceipt = useReceiptStore((state) => state.setReceipt);
  const { subtotal, total } = useReceiptTotals();

  return (
    <Card className="receity-card">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Totals</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <Separator />
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="payment-method" className="text-xs text-muted-foreground">
              Payment
            </Label>
            <select
              id="payment-method"
              value={receipt.paymentMethod}
              onChange={(e) =>
                setReceipt({ paymentMethod: e.target.value as PaymentMethod })
              }
              className={cn(
                "border-input bg-background h-8 w-full min-w-[120px] rounded-lg border px-2.5 text-sm",
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
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
