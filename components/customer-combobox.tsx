"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  filterCustomers,
  getRecentCustomers,
  sortCustomersByActivity,
} from "@/lib/customer-utils";
import { useCustomerStore } from "@/lib/store/customer-store";
import { useReceiptStore } from "@/lib/store/receipt-store";
import type { Customer } from "@/types/customer";

type CustomerComboboxProps = {
  name: string;
  phone: string;
  onSelect: (customer: Pick<Customer, "name" | "phone">) => void;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
};

export function CustomerCombobox({
  name,
  phone,
  onSelect,
  onNameChange,
  onPhoneChange,
}: CustomerComboboxProps) {
  const customers = useCustomerStore((state) => state.customers);
  const bootstrapFromReceipts = useCustomerStore(
    (state) => state.bootstrapFromReceipts,
  );
  const savedReceipts = useReceiptStore((state) => state.savedReceipts);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bootstrapFromReceipts(savedReceipts);
  }, [bootstrapFromReceipts, savedReceipts]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const sortedCustomers = useMemo(
    () => sortCustomersByActivity(customers),
    [customers],
  );

  const recentCustomers = useMemo(
    () => getRecentCustomers(sortedCustomers),
    [sortedCustomers],
  );

  const filteredCustomers = useMemo(() => {
    if (!query.trim()) return sortedCustomers;
    return filterCustomers(sortedCustomers, query);
  }, [sortedCustomers, query]);

  const showRecent = open && !query.trim() && recentCustomers.length > 0;

  const listCustomers = useMemo(() => {
    if (query.trim()) return filteredCustomers;
    const recentIds = new Set(recentCustomers.map((customer) => customer.id));
    return sortedCustomers.filter((customer) => !recentIds.has(customer.id));
  }, [query, filteredCustomers, recentCustomers, sortedCustomers]);

  const handleSelect = (customer: Customer) => {
    onSelect({ name: customer.name, phone: customer.phone });
    setQuery("");
    setOpen(false);
  };

  const displayValue =
    name.trim() || phone.trim()
      ? [name.trim(), phone.trim()].filter(Boolean).join(" · ")
      : "";

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="relative space-y-2">
        <Label htmlFor="customer-search">Customer</Label>
        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="customer-search"
            value={open ? query : displayValue}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setQuery("");
              setOpen(true);
            }}
            placeholder="Search by name or phone..."
            className="pl-8"
            autoComplete="off"
          />
        </div>

        {open && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border bg-background shadow-md">
            {showRecent && (
              <div className="border-b p-2">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Recent customers
                </p>
                {recentCustomers.map((customer) => (
                  <button
                    key={`recent-${customer.id}`}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => handleSelect(customer)}
                  >
                    <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {customer.name}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {customer.phone}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {filteredCustomers.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">
                {customers.length === 0
                  ? "No saved customers yet. Type a name below."
                  : "No matching customers."}
              </p>
            ) : (
              <ul className="p-1">
                {listCustomers.map((customer) => (
                  <li key={customer.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => handleSelect(customer)}
                    >
                      <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate font-medium">
                        {customer.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {customer.phone}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Customer Name</Label>
          <Input
            id="customer-name"
            placeholder="John Doe"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer-phone">Customer Phone</Label>
          <Input
            id="customer-phone"
            placeholder="+254 7XX XXX XXX"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
