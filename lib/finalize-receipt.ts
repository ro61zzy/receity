"use client";

import { deductStockForReceipt } from "@/lib/inventory-deduct";
import { useCustomerStore } from "@/lib/store/customer-store";
import { useInventoryStore } from "@/lib/store/inventory-store";
import { useReceiptStore } from "@/lib/store/receipt-store";
import { toast } from "sonner";

/** Save receipt, sync customer, and deduct linked inventory stock */
export function finalizeReceipt(): void {
  const receipt = useReceiptStore.getState().receipt;
  const saveCurrentReceipt = useReceiptStore.getState().saveCurrentReceipt;
  const inventory = useInventoryStore.getState();

  saveCurrentReceipt();

  const savedReceipts = useReceiptStore.getState().savedReceipts;
  const saved = savedReceipts.find(
    (entry) => entry.receiptNumber === receipt.receiptNumber,
  );

  if (saved) {
    useCustomerStore.getState().syncFromReceipt(saved, savedReceipts);
  }

  const alreadyDeducted = inventory.isReceiptDeducted(receipt.receiptNumber);
  const { products, result } = deductStockForReceipt(
    receipt,
    inventory.products,
    alreadyDeducted,
  );

  if (result.deducted) {
    useInventoryStore.getState().setProducts(products);
    useInventoryStore.getState().markReceiptDeducted(receipt.receiptNumber);

    for (const adj of result.adjustments) {
      toast.success(`${adj.label}: ${adj.from} → ${adj.to} remaining`);
    }
  }

  for (const warning of result.warnings) {
    toast.warning(warning);
  }
}
