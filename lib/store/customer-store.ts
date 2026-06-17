"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { computeCustomerStats } from "@/lib/customer-utils";
import { STORAGE_KEYS } from "@/lib/constants";
import { hasValidPhone, normalizePhone } from "@/lib/phone";
import type { Customer } from "@/types/customer";
import type { SavedReceipt } from "@/types/receipt";

function buildCustomer(
  base: Pick<Customer, "id" | "name" | "phone" | "receiptIds" | "createdAt">,
  savedReceipts: SavedReceipt[],
  updatedAt?: string,
): Customer {
  const stats = computeCustomerStats(base.receiptIds, savedReceipts);
  return {
    ...base,
    ...stats,
    updatedAt: updatedAt ?? new Date().toISOString(),
  };
}

interface CustomerStore {
  customers: Customer[];

  syncFromReceipt: (saved: SavedReceipt, savedReceipts: SavedReceipt[]) => void;
  removeReceipt: (receiptId: string, savedReceipts: SavedReceipt[]) => void;
  bootstrapFromReceipts: (savedReceipts: SavedReceipt[]) => void;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set, get) => ({
      customers: [],

      syncFromReceipt: (saved, savedReceipts) => {
        if (!hasValidPhone(saved.customerPhone)) return;

        const phoneKey = normalizePhone(saved.customerPhone);
        const now = new Date().toISOString();
        const { customers } = get();
        const existingIndex = customers.findIndex(
          (customer) => normalizePhone(customer.phone) === phoneKey,
        );

        if (existingIndex >= 0) {
          const existing = customers[existingIndex];
          const receiptIds = existing.receiptIds.includes(saved.id)
            ? existing.receiptIds
            : [...existing.receiptIds, saved.id];

          const updated = buildCustomer(
            {
              id: existing.id,
              name: saved.customerName.trim() || existing.name,
              phone: saved.customerPhone.trim() || existing.phone,
              receiptIds,
              createdAt: existing.createdAt,
            },
            savedReceipts,
            now,
          );

          const rest = customers.filter((_, index) => index !== existingIndex);
          set({ customers: [updated, ...rest] });
          return;
        }

        const created = buildCustomer(
          {
            id: crypto.randomUUID(),
            name: saved.customerName.trim() || "Customer",
            phone: saved.customerPhone.trim(),
            receiptIds: [saved.id],
            createdAt: now,
          },
          savedReceipts,
          now,
        );

        set({ customers: [created, ...customers] });
      },

      removeReceipt: (receiptId, savedReceipts) => {
        const { customers } = get();
        const next: Customer[] = [];

        for (const customer of customers) {
          if (!customer.receiptIds.includes(receiptId)) {
            next.push(customer);
            continue;
          }

          const receiptIds = customer.receiptIds.filter((id) => id !== receiptId);
          if (receiptIds.length === 0) continue;

          next.push(
            buildCustomer(
              {
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                receiptIds,
                createdAt: customer.createdAt,
              },
              savedReceipts,
            ),
          );
        }

        set({ customers: next });
      },

      bootstrapFromReceipts: (savedReceipts) => {
        if (get().customers.length > 0) return;

        const grouped = new Map<
          string,
          { name: string; phone: string; receiptIds: string[]; createdAt: string }
        >();

        for (const receipt of savedReceipts) {
          if (!hasValidPhone(receipt.customerPhone)) continue;

          const phoneKey = normalizePhone(receipt.customerPhone);
          const existing = grouped.get(phoneKey);

          if (existing) {
            if (!existing.receiptIds.includes(receipt.id)) {
              existing.receiptIds.push(receipt.id);
            }
            if (receipt.customerName.trim()) {
              existing.name = receipt.customerName.trim();
            }
            if (receipt.createdAt < existing.createdAt) {
              existing.createdAt = receipt.createdAt;
            }
            continue;
          }

          grouped.set(phoneKey, {
            name: receipt.customerName.trim() || "Customer",
            phone: receipt.customerPhone.trim(),
            receiptIds: [receipt.id],
            createdAt: receipt.createdAt,
          });
        }

        const customers = [...grouped.values()].map((entry) =>
          buildCustomer(
            {
              id: crypto.randomUUID(),
              name: entry.name,
              phone: entry.phone,
              receiptIds: entry.receiptIds,
              createdAt: entry.createdAt,
            },
            savedReceipts,
          ),
        );

        customers.sort((a, b) =>
          b.lastPurchaseDate.localeCompare(a.lastPurchaseDate),
        );

        if (customers.length > 0) {
          set({ customers });
        }
      },
    }),
    {
      name: STORAGE_KEYS.customers,
      version: 1,
    },
  ),
);
