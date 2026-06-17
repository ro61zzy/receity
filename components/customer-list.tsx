"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerDetailSheet } from "@/components/customer-detail-sheet";
import { formatCurrency } from "@/lib/currency";
import {
  filterCustomers,
  formatCustomerDate,
  sortCustomersByActivity,
} from "@/lib/customer-utils";
import { useCustomerStore } from "@/lib/store/customer-store";
import { useReceiptStore } from "@/lib/store/receipt-store";
import type { Customer } from "@/types/customer";

export function CustomerList() {
  const customers = useCustomerStore((state) => state.customers);
  const bootstrapFromReceipts = useCustomerStore(
    (state) => state.bootstrapFromReceipts,
  );
  const savedReceipts = useReceiptStore((state) => state.savedReceipts);

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );

  useEffect(() => {
    bootstrapFromReceipts(savedReceipts);
  }, [bootstrapFromReceipts, savedReceipts]);

  const filteredCustomers = useMemo(() => {
    const sorted = sortCustomersByActivity(customers);
    return filterCustomers(sorted, search);
  }, [customers, search]);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">All Customers</CardTitle>
            <CardDescription>
              {filteredCustomers.length} customer
              {filteredCustomers.length === 1 ? "" : "s"}
              {search.trim() ? " matching search" : ""}
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or phone..."
              className="pl-8"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Users className="h-10 w-10 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {customers.length === 0
                    ? "No customers yet"
                    : "No matching customers"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {customers.length === 0
                    ? "Customers are added automatically when you complete receipts."
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
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                      <TableHead>Last Purchase</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedCustomer(customer)}
                      >
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell className="text-right">
                          {customer.purchaseCount}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(customer.totalSpent)}
                        </TableCell>
                        <TableCell>
                          {formatCustomerDate(customer.lastPurchaseDate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="space-y-3 md:hidden">
                {filteredCustomers.map((customer) => (
                  <Card
                    key={customer.id}
                    className="cursor-pointer shadow-sm transition-colors hover:bg-muted/30"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <CardContent className="space-y-2 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(customer.totalSpent)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{customer.purchaseCount} orders</span>
                        <span>
                          Last: {formatCustomerDate(customer.lastPurchaseDate)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CustomerDetailSheet
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />
    </>
  );
}
