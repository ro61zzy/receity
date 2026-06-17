"use client";

import { useState } from "react";
import { Package, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/currency";
import {
  getProductLabel,
  getStockStatus,
  getStockStatusLabel,
  groupProductsByCategory,
  isLowStock,
} from "@/lib/inventory-utils";
import { useInventoryStore } from "@/lib/store/inventory-store";
import type { Product } from "@/types/inventory";
import type { StockStatus } from "@/lib/inventory-utils";

function StockBadge({ status }: { status: StockStatus }) {
  const variant =
    status === "good" ? "success" : status === "low" ? "warning" : "destructive";

  return (
    <Badge variant={variant} className="shrink-0">
      {getStockStatusLabel(status)}
    </Badge>
  );
}

function ProductStockInput({
  product,
  onUpdate,
}: {
  product: Product;
  onUpdate: (stock: number) => void;
}) {
  return (
    <Input
      type="number"
      min={0}
      className="h-8 w-20 text-right"
      value={product.stock}
      onChange={(e) =>
        onUpdate(Math.max(0, Number(e.target.value) || 0))
      }
    />
  );
}

export function InventoryTable() {
  const products = useInventoryStore((state) => state.products);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const addProduct = useInventoryStore((state) => state.addProduct);
  const clearProducts = useInventoryStore((state) => state.clearProducts);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    size: "",
    color: "",
    stock: 0,
    unitPrice: 0,
  });

  const grouped = groupProductsByCategory(products);
  const lowStockCount = products.filter(isLowStock).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleAddProduct = () => {
    if (!newProduct.name.trim() || !newProduct.category.trim()) {
      toast.error("Product name and category are required");
      return;
    }

    addProduct({
      ...newProduct,
      lowStockThreshold: 5,
    });
    setNewProduct({
      name: "",
      category: "",
      size: "",
      color: "",
      stock: 0,
      unitPrice: 0,
    });
    setShowAddForm(false);
    toast.success("✓ Product added");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {outOfStockCount > 0 && (
          <Badge variant="destructive">{outOfStockCount} out of stock</Badge>
        )}
        {lowStockCount > 0 && (
          <Badge variant="warning">{lowStockCount} low stock</Badge>
        )}
        <Badge variant="secondary">{products.length} products</Badge>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="mr-1 h-4 w-4" />
            {showAddForm ? "Cancel" : "Add Product"}
          </Button>
          {products.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9"
              onClick={() => {
                clearProducts();
                toast.success("Inventory cleared");
              }}
            >
              <RotateCcw className="mr-1 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {products.length === 0 && !showAddForm && (
        <EmptyState
          emoji="📦"
          title="No products yet"
          description="Add your first product and Receity will automatically deduct stock when receipts are completed."
          action={
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add your first product
            </Button>
          }
        />
      )}

      {showAddForm && (
        <Card className="receity-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add New Product</CardTitle>
            <CardDescription>
              Add any product — not just magnetic frames
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Product Name</Label>
              <Input
                placeholder="Magnetic Frame"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input
                placeholder="Magnetic Frames"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Size</Label>
              <Input
                placeholder="A4"
                value={newProduct.size}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, size: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <Input
                placeholder="Black"
                value={newProduct.color}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, color: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Stock</Label>
              <Input
                type="number"
                min={0}
                value={newProduct.stock || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    stock: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Unit Price (KES)</Label>
              <Input
                type="number"
                min={0}
                value={newProduct.unitPrice || ""}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    unitPrice: Math.max(0, Number(e.target.value) || 0),
                  })
                }
              />
            </div>
            <div className="flex items-end sm:col-span-2 lg:col-span-3">
              <Button onClick={handleAddProduct}>Save Product</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.entries(grouped).map(([category, categoryProducts]) => (
        <Card key={category} className="receity-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary/70" />
              <CardTitle className="text-base">{category}</CardTitle>
            </div>
            <CardDescription>
              Stock deducts automatically when you complete a receipt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right w-28">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryProducts
                    .sort((a, b) => a.size.localeCompare(b.size))
                    .map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.name}
                        </TableCell>
                        <TableCell>{product.size || "—"}</TableCell>
                        <TableCell>{product.color || "—"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.unitPrice)}
                        </TableCell>
                        <TableCell>
                          <StockBadge status={getStockStatus(product)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ProductStockInput
                            product={product}
                            onUpdate={(stock) =>
                              updateProduct(product.id, { stock })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

            <div className="space-y-2 md:hidden">
              {categoryProducts
                .sort((a, b) => a.size.localeCompare(b.size))
                .map((product) => (
                  <div
                    key={product.id}
                    className="rounded-lg border border-border bg-background/50 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getProductLabel(product)}
                        </p>
                      </div>
                      <StockBadge status={getStockStatus(product)} />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {formatCurrency(product.unitPrice)}
                      </span>
                      <ProductStockInput
                        product={product}
                        onUpdate={(stock) =>
                          updateProduct(product.id, { stock })
                        }
                      />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
