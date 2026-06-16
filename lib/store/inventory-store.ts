"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyFramePrices } from "@/lib/inventory-seed";
import { STORAGE_KEYS } from "@/lib/constants";
import type { Product } from "@/types/inventory";

interface InventoryStore {
  products: Product[];
  deductedReceiptNumbers: string[];

  setProducts: (products: Product[]) => void;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id">>) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  removeProduct: (id: string) => void;
  markReceiptDeducted: (receiptNumber: string) => void;
  isReceiptDeducted: (receiptNumber: string) => boolean;
  clearProducts: () => void;
}

export const useInventoryStore = create<InventoryStore>()(
  persist(
    (set, get) => ({
      products: [],
      deductedReceiptNumbers: [],

      setProducts: (products) => set({ products }),

      updateProduct: (id, updates) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),

      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            { ...product, id: crypto.randomUUID() },
          ],
        })),

      removeProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),

      markReceiptDeducted: (receiptNumber) =>
        set((state) => ({
          deductedReceiptNumbers: state.deductedReceiptNumbers.includes(
            receiptNumber,
          )
            ? state.deductedReceiptNumbers
            : [...state.deductedReceiptNumbers, receiptNumber],
        })),

      isReceiptDeducted: (receiptNumber) =>
        get().deductedReceiptNumbers.includes(receiptNumber),

      clearProducts: () => set({ products: [] }),
    }),
    {
      name: STORAGE_KEYS.inventory,
      partialize: (state) => ({
        products: state.products,
        deductedReceiptNumbers: state.deductedReceiptNumbers,
      }),
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<InventoryStore> | undefined;
        const products = applyFramePrices(
          persistedState?.products?.length
            ? persistedState.products
            : current.products,
        );

        return {
          ...current,
          products,
          deductedReceiptNumbers:
            persistedState?.deductedReceiptNumbers ?? [],
        };
      },
    },
  ),
);

export function useProductById(productId: string | undefined) {
  return useInventoryStore((state) =>
    productId ? state.products.find((p) => p.id === productId) : undefined,
  );
}
