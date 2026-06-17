"use client";

import { Banknote, TrendingUp, Wallet } from "lucide-react";
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
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="receity-card sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Wallet className="h-3.5 w-3.5" />
            Today&apos;s Revenue
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-semibold tracking-tight">
            {formatCurrency(stats.revenue)}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            {stats.receiptCount === 0
              ? "No receipts yet today"
              : `${stats.receiptCount} receipt${stats.receiptCount === 1 ? "" : "s"} today`}
          </p>
        </CardContent>
      </Card>

      <Card className="receity-card sm:col-span-2 lg:col-span-1">
        <CardHeader className="pb-1">
          <CardTitle className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <Banknote className="h-3.5 w-3.5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activePayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Payments will appear here as you complete receipts.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {activePayments.map((method) => (
                <Badge key={method} variant="outline" className="rounded-full px-2.5">
                  {method}
                  <span className="ml-1 font-semibold text-foreground">
                    {formatCurrency(stats.paymentBreakdown[method])}
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
