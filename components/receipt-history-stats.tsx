"use client";

import { Banknote, ReceiptText, Wallet } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import { getTodayStats } from "@/lib/receipt-history";
import { PAYMENT_METHODS } from "@/types/receipt";
import type { SavedReceipt } from "@/types/receipt";

type ReceiptHistoryStatsProps = {
  receipts: SavedReceipt[];
};

export function ReceiptHistoryStats({ receipts }: ReceiptHistoryStatsProps) {
  const stats = getTodayStats(receipts);
  const activePayments = PAYMENT_METHODS.filter(
    (method) => stats.paymentBreakdown[method] > 0,
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Wallet className="h-4 w-4" />
            Today&apos;s Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight">
            {formatCurrency(stats.revenue)}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <ReceiptText className="h-4 w-4" />
            Receipts Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold tracking-tight">
            {stats.receiptCount}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Banknote className="h-4 w-4" />
            Payment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No receipts today yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activePayments.map((method) => (
                <Badge key={method} variant="secondary" className="text-xs">
                  {method}: {formatCurrency(stats.paymentBreakdown[method])}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
