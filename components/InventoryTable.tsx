"use client";

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
  groupProductsByCategory,
  isLowStock,
} from "@/lib/inventory-utils";
import { useInventoryStore } from "@/lib/store/inventory-store";
import { useState } from "react";

export function InventoryTable() {
  const products = useInventoryStore((state) => state.products);
  const updateProduct = useInventoryStore((state) => state.updateProduct);
  const addProduct = useInventoryStore((state) => state.addProduct);
  const resetToSeed = useInventoryStore((state) => state.resetToSeed);

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
    toast.success("Product added");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        {lowStockCount > 0 && (
          <Badge variant="destructive">{lowStockCount} low stock</Badge>
        )}
        <Badge variant="secondary">{products.length} products</Badge>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Product
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              resetToSeed();
              toast.success("Inventory reset to defaults");
            }}
          >
            <RotateCcw className="mr-1 h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      {showAddForm && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Add New Product</CardTitle>
            <CardDescription>
              Add any product — not just magnetic frames
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                placeholder="Magnetic Frame"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                placeholder="Magnetic Frames"
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                placeholder="A4"
                value={newProduct.size}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, size: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <Input
                placeholder="Black"
                value={newProduct.color}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, color: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
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
            <div className="space-y-2">
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
        <Card key={category} className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">{category}</CardTitle>
            </div>
            <CardDescription>
              Stock updates automatically when you complete a receipt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right w-28">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryProducts
                  .sort((a, b) => a.size.localeCompare(b.size))
                  .map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.size || "—"}
                      </TableCell>
                      <TableCell>{product.color || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {getProductLabel(product)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.unitPrice)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isLowStock(product) && (
                            <Badge variant="destructive" className="text-xs">
                              Low
                            </Badge>
                          )}
                          <Input
                            type="number"
                            min={0}
                            className="h-8 w-20 text-right"
                            value={product.stock}
                            onChange={(e) =>
                              updateProduct(product.id, {
                                stock: Math.max(
                                  0,
                                  Number(e.target.value) || 0,
                                ),
                              })
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
