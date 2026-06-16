import type { Product } from "@/types/inventory";

export function getProductLabel(product: Product): string {
  return `${product.size} ${product.color} ${product.name}`;
}

export function getReceiptItemName(product: Product): string {
  return `${product.size} ${product.name}s (${product.color})`;
}

export function isLowStock(product: Product): boolean {
  return product.stock <= product.lowStockThreshold;
}

export function groupProductsBySize(
  products: Product[],
): Record<string, Product[]> {
  return products.reduce<Record<string, Product[]>>((groups, product) => {
    const key = product.size || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(product);
    return groups;
  }, {});
}

export function groupProductsByCategory(
  products: Product[],
): Record<string, Product[]> {
  return products.reduce<Record<string, Product[]>>((groups, product) => {
    const key = product.category || "General";
    if (!groups[key]) groups[key] = [];
    groups[key].push(product);
    return groups;
  }, {});
}
