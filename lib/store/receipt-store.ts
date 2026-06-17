"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatReceiptNumber, getNextReceiptNumber, getReceiptYear } from "@/lib/receipt-number";
import { calculateTotals } from "@/lib/receipt-calculations";
import { stripLegacyBusinessDefaults } from "@/lib/business-migration";
import { STORAGE_KEYS } from "@/lib/constants";
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
    tiktok: business?.tiktok ?? "",
    instagram: business?.instagram ?? "",
    slogan: business?.slogan ?? "",
  };
}

function normalizeSavedReceipt(receipt: Partial<SavedReceipt>): SavedReceipt {
  const { subtotal, total } = calculateTotals(receipt.items ?? []);
  return {
    receiptNumber: receipt.receiptNumber ?? "",
    date: receipt.date ?? getTodayDate(),
    customerName: receipt.customerName ?? "",
    customerPhone: receipt.customerPhone ?? "",
    paymentMethod: receipt.paymentMethod ?? "M-Pesa",
    servedBy: receipt.servedBy ?? "",
    notes: receipt.notes ?? "",
    items: receipt.items ?? [],
    id: receipt.id ?? crypto.randomUUID(),
    createdAt: receipt.createdAt ?? new Date().toISOString(),
    subtotal: receipt.subtotal ?? subtotal,
    total: receipt.total ?? total,
    stockDeducted: receipt.stockDeducted,
  };
}

function createInitialReceipt(counter: number, year?: number): ReceiptDetails {
  const receiptYear = year ?? getReceiptYear();
  const { number } = getNextReceiptNumber(counter, receiptYear);
  return {
    receiptNumber: number,
    date: getTodayDate(),
    customerName: "",
    customerPhone: "",
    paymentMethod: "M-Pesa",
    servedBy: "",
    notes: "",
    items: [createEmptyItem()],
  };
}

function normalizeReceiptCounter(
  counter: number,
  storedYear: number | undefined,
): { counter: number; year: number } {
  const currentYear = getReceiptYear();
  if (storedYear !== currentYear) {
    return { counter: 0, year: currentYear };
  }
  return { counter, year: currentYear };
}

interface ReceiptStore {
  business: BusinessInfo;
  receiptCounter: number;
  receiptCounterYear: number;
  receipt: ReceiptDetails;
  savedReceipts: SavedReceipt[];

  setBusiness: (updates: Partial<BusinessInfo>) => void;
  setReceipt: (updates: Partial<Omit<ReceiptDetails, "items">>) => void;
  addItem: () => void;
  updateItem: (id: string, updates: Partial<Omit<ReceiptItem, "id">>) => void;
  removeItem: (id: string) => void;
  newReceipt: () => void;
  saveCurrentReceipt: () => void;
  deleteSavedReceipt: (id: string) => void;
  duplicateSavedReceipt: (id: string) => void;
  incrementCounter: () => void;
}

export const useReceiptStore = create<ReceiptStore>()(
  persist(
    (set, get) => ({
      business: normalizeBusiness(undefined),
      receiptCounter: 0,
      receiptCounterYear: getReceiptYear(),
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
        const { receiptCounter, receiptCounterYear } = get();
        const { year } = normalizeReceiptCounter(
          receiptCounter,
          receiptCounterYear,
        );
        const newCounter = receiptCounter + 1;
        set({
          receiptCounter: newCounter,
          receiptCounterYear: year,
          receipt: createInitialReceipt(newCounter, year),
        });
      },

      saveCurrentReceipt: () => {
        const { receipt, savedReceipts } = get();
        const { subtotal, total } = calculateTotals(receipt.items);
        const hasContent =
          receipt.customerName.trim() ||
          receipt.items.some((item) => item.name.trim());

        if (!hasContent) return;

        const existingIndex = savedReceipts.findIndex(
          (saved) => saved.receiptNumber === receipt.receiptNumber,
        );

        if (existingIndex >= 0) {
          const updated: SavedReceipt = {
            ...savedReceipts[existingIndex],
            ...receipt,
            subtotal,
            total,
          };
          const rest = savedReceipts.filter((_, index) => index !== existingIndex);
          set({ savedReceipts: [updated, ...rest] });
          return;
        }

        const saved: SavedReceipt = {
          ...receipt,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          subtotal,
          total,
        };

        set({ savedReceipts: [saved, ...savedReceipts] });
      },

      deleteSavedReceipt: (id) =>
        set((state) => ({
          savedReceipts: state.savedReceipts.filter((saved) => saved.id !== id),
        })),

      duplicateSavedReceipt: (id) => {
        const saved = get().savedReceipts.find((receipt) => receipt.id === id);
        if (!saved) return;

        const { receipt } = get();
        set({
          receipt: {
            ...receipt,
            date: getTodayDate(),
            customerName: saved.customerName,
            customerPhone: saved.customerPhone,
            paymentMethod: saved.paymentMethod,
            servedBy: saved.servedBy,
            notes: saved.notes,
            items: saved.items.map((item) => ({
              ...item,
              id: crypto.randomUUID(),
            })),
          },
        });
      },
    }),
    {
      name: STORAGE_KEYS.business,
      version: 3,
      migrate: (persistedState, version) => {
        let state = persistedState as Partial<ReceiptStore>;

        if (version < 2) {
          state = {
            ...state,
            business: normalizeBusiness(
              stripLegacyBusinessDefaults(
                state.business as Partial<BusinessInfo> | undefined,
              ),
            ),
          };
        }

        if (version < 3) {
          state = {
            ...state,
            savedReceipts: (state.savedReceipts ?? []).map((saved) =>
              normalizeSavedReceipt(saved as Partial<SavedReceipt>),
            ),
          };
        }

        return state as ReceiptStore;
      },
      partialize: (state) => ({
        business: state.business,
        receiptCounter: state.receiptCounter,
        receiptCounterYear: state.receiptCounterYear,
        savedReceipts: state.savedReceipts,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<ReceiptStore> | undefined;
        const { counter, year } = normalizeReceiptCounter(
          persistedState?.receiptCounter ?? 0,
          persistedState?.receiptCounterYear,
        );
        const receipt = createInitialReceipt(counter, year);
        const persistedReceipt = persistedState?.receipt as
          | Partial<ReceiptDetails>
          | undefined;

        return {
          ...current,
          business: normalizeBusiness(persistedState?.business),
          receiptCounter: counter,
          receiptCounterYear: year,
          savedReceipts: (persistedState?.savedReceipts ?? []).map((saved) =>
            normalizeSavedReceipt(saved as Partial<SavedReceipt>),
          ),
          receipt: {
            ...receipt,
            paymentMethod:
              persistedReceipt?.paymentMethod ?? receipt.paymentMethod,
          },
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
