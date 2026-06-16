"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatReceiptNumber, getNextReceiptNumber } from "@/lib/receipt-number";
import { calculateTotals } from "@/lib/receipt-calculations";
import { DEFAULT_SOCIAL, STORAGE_KEYS } from "@/lib/constants";
import type {
  BusinessInfo,
  ReceiptDetails,
  ReceiptItem,
  SavedReceipt,
} from "@/types/receipt";

function createEmptyItem(): ReceiptItem {
  return {
    id: crypto.randomUUID(),
    name: "",
    quantity: 1,
    unitPrice: 0,
  };
}

function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

function normalizeBusiness(
  business: Partial<BusinessInfo> | undefined,
): BusinessInfo {
  return {
    logo: business?.logo ?? null,
    name: business?.name ?? "",
    phone: business?.phone ?? "",
    whatsapp: business?.whatsapp ?? "",
    address: business?.address ?? "",
    tiktok: business?.tiktok ?? DEFAULT_SOCIAL.tiktok,
    instagram: business?.instagram ?? DEFAULT_SOCIAL.instagram,
  };
}

function createInitialReceipt(counter: number): ReceiptDetails {
  const { number } = getNextReceiptNumber(counter);
  return {
    receiptNumber: number,
    date: getTodayDate(),
    customerName: "",
    customerPhone: "",
    items: [createEmptyItem()],
  };
}

interface ReceiptStore {
  business: BusinessInfo;
  receiptCounter: number;
  receipt: ReceiptDetails;
  savedReceipts: SavedReceipt[];

  setBusiness: (updates: Partial<BusinessInfo>) => void;
  setReceipt: (updates: Partial<Omit<ReceiptDetails, "items">>) => void;
  addItem: () => void;
  updateItem: (id: string, updates: Partial<Omit<ReceiptItem, "id">>) => void;
  removeItem: (id: string) => void;
  newReceipt: () => void;
  saveCurrentReceipt: () => void;
  incrementCounter: () => void;
}

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    (set, get) => ({
      business: normalizeBusiness(undefined),
      receiptCounter: 0,
      receipt: createInitialReceipt(0),
      savedReceipts: [],

      setBusiness: (updates) =>
        set((state) => ({
          business: { ...state.business, ...updates },
        })),

      setReceipt: (updates) =>
        set((state) => ({
          receipt: { ...state.receipt, ...updates },
        })),

      addItem: () =>
        set((state) => ({
          receipt: {
            ...state.receipt,
            items: [...state.receipt.items, createEmptyItem()],
          },
        })),

      updateItem: (id, updates) =>
        set((state) => ({
          receipt: {
            ...state.receipt,
            items: state.receipt.items.map((item) =>
              item.id === id ? { ...item, ...updates } : item,
            ),
          },
        })),

      removeItem: (id) =>
        set((state) => {
          const items = state.receipt.items.filter((item) => item.id !== id);
          return {
            receipt: {
              ...state.receipt,
              items: items.length > 0 ? items : [createEmptyItem()],
            },
          };
        }),

      incrementCounter: () =>
        set((state) => ({
          receiptCounter: state.receiptCounter + 1,
        })),

      newReceipt: () => {
        const { receiptCounter } = get();
        const newCounter = receiptCounter + 1;
        set({
          receiptCounter: newCounter,
          receipt: createInitialReceipt(newCounter),
        });
      },

      saveCurrentReceipt: () => {
        const { receipt, savedReceipts } = get();
        const { subtotal, total } = calculateTotals(receipt.items);
        const hasContent =
          receipt.customerName.trim() ||
          receipt.items.some((item) => item.name.trim());

        if (!hasContent) return;

        const saved: SavedReceipt = {
          ...receipt,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          subtotal,
          total,
        };

        set({ savedReceipts: [saved, ...savedReceipts] });
      },
    }),
    {
      name: STORAGE_KEYS.business,
      partialize: (state) => ({
        business: state.business,
        receiptCounter: state.receiptCounter,
        savedReceipts: state.savedReceipts,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<ReceiptStore> | undefined;
        const counter = persistedState?.receiptCounter ?? 0;
        return {
          ...current,
          business: normalizeBusiness(persistedState?.business),
          receiptCounter: counter,
          savedReceipts: persistedState?.savedReceipts ?? [],
          receipt: createInitialReceipt(counter),
        };
      },
    },
  ),
);

export function useReceiptTotals() {
  const items = useReceiptStore((state) => state.receipt.items);
  return calculateTotals(items);
}

export { formatReceiptNumber, getTodayDate };
