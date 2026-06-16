"use client";

import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import { calculateItemTotal } from "@/lib/receipt-calculations";
import {
  getReceiptItemName,
  groupProductsByCategory,
} from "@/lib/inventory-utils";
import { useInventoryStore } from "@/lib/store/inventory-store";
import { useReceiptStore } from "@/lib/store/receipt-store";
import { cn } from "@/lib/utils";

function ProductSelect({
  productId,
  onSelect,
}: {
  productId?: string;
  onSelect: (productId: string | undefined) => void;
}) {
  const products = useInventoryStore((state) => state.products);
  const grouped = groupProductsByCategory(products);

  return (
    <select
      value={productId ?? ""}
      onChange={(e) => onSelect(e.target.value || undefined)}
      className={cn(
        "border-input bg-background h-8 w-full rounded-lg border px-2 text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 outline-none focus-visible:ring-3",
      )}
    >
      <option value="">Custom item...</option>
      {Object.entries(grouped).map(([category, categoryProducts]) => (
        <optgroup key={category} label={category}>
          {categoryProducts
            .sort((a, b) =>
              `${a.size}${a.color}`.localeCompare(`${b.size}${b.color}`),
            )
            .map((product) => (
              <option key={product.id} value={product.id}>
                {product.size} {product.color} — {product.stock} left @{" "}
                {formatCurrency(product.unitPrice)}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}

function ItemRowFields({
  item,
  index,
}: {
  item: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    productId?: string;
  };
  index: number;
}) {
  const updateItem = useReceiptStore((state) => state.updateItem);
  const removeItem = useReceiptStore((state) => state.removeItem);
  const items = useReceiptStore((state) => state.receipt.items);
  const products = useInventoryStore((state) => state.products);

  const linkedProduct = item.productId
    ? products.find((p) => p.id === item.productId)
    : undefined;

  const handleProductSelect = (productId: string | undefined) => {
    if (!productId) {
      updateItem(item.id, { productId: undefined });
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    updateItem(item.id, {
      productId: product.id,
      name: getReceiptItemName(product),
      unitPrice: product.unitPrice,
    });
  };

  return (
    <>
      <div className="space-y-2">
        <Label>From inventory</Label>
        <ProductSelect
          productId={item.productId}
          onSelect={handleProductSelect}
        />
        {linkedProduct && (
          <p className="text-xs text-muted-foreground">
            {linkedProduct.stock} in stock — will deduct on receipt completion
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Item name</Label>
        <Input
          placeholder="Item name"
          value={item.name}
          onChange={(e) =>
            updateItem(item.id, { name: e.target.value, productId: undefined })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Quantity</Label>
          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              updateItem(item.id, {
                quantity: Math.max(1, Number(e.target.value) || 1),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Unit Price</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={item.unitPrice || ""}
            onChange={(e) =>
              updateItem(item.id, {
                unitPrice: Math.max(0, Number(e.target.value) || 0),
                productId: undefined,
              })
            }
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Total: {formatCurrency(calculateItemTotal(item))}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => removeItem(item.id)}
          disabled={items.length === 1}
          aria-label="Remove item"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </>
  );
}

export function ItemsTable() {
  const items = useReceiptStore((state) => state.receipt.items);
  const addItem = useReceiptStore((state) => state.addItem);
  const updateItem = useReceiptStore((state) => state.updateItem);
  const removeItem = useReceiptStore((state) => state.removeItem);
  const products = useInventoryStore((state) => state.products);

  const handleProductSelect = (itemId: string, productId: string | undefined) => {
    if (!productId) {
      updateItem(itemId, { productId: undefined });
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    updateItem(itemId, {
      productId: product.id,
      name: getReceiptItemName(product),
      unitPrice: product.unitPrice,
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Items</CardTitle>
            </div>
            <CardDescription>
              Pick from inventory or enter a custom item
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Inventory</TableHead>
                <TableHead className="w-[28%]">Item</TableHead>
                <TableHead className="w-[12%]">Qty</TableHead>
                <TableHead className="w-[14%]">Price</TableHead>
                <TableHead className="w-[14%] text-right">Total</TableHead>
                <TableHead className="w-[4%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <ProductSelect
                      productId={item.productId}
                      onSelect={(id) => handleProductSelect(item.id, id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(item.id, {
                          name: e.target.value,
                          productId: undefined,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unitPrice || ""}
                      onChange={(e) =>
                        updateItem(item.id, {
                          unitPrice: Math.max(0, Number(e.target.value) || 0),
                          productId: undefined,
                        })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(calculateItemTotal(item))}
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4 md:hidden">
          {items.map((item, index) => (
            <div key={item.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
              </div>
              <ItemRowFields item={item} index={index} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
