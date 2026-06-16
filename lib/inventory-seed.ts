import type { Product } from "@/types/inventory";

const FRAME_SIZES = ["A2", "A3", "A4", "A5"] as const;

/** KES prices per frame size */
export const FRAME_PRICES: Record<string, number> = {
  A2: 750,
  A3: 450,
  A4: 350,
  A5: 250,
};

const SEED_STOCK: Record<string, Record<string, number>> = {
  A2: { Black: 9, Grey: 5 },
  A3: { Black: 5, Grey: 4 },
  A4: { Black: 101, Grey: 30 },
  A5: { Black: 22, Grey: 9 },
};

export function createDefaultMagneticFrameInventory(): Product[] {
  const products: Product[] = [];

  for (const size of FRAME_SIZES) {
    for (const [color, stock] of Object.entries(SEED_STOCK[size])) {
      products.push({
        id: `frame-${size.toLowerCase()}-${color.toLowerCase()}`,
        name: "Magnetic Frame",
        category: "Magnetic Frames",
        size,
        color,
        stock,
        unitPrice: FRAME_PRICES[size],
        lowStockThreshold: 5,
      });
    }
  }

  return products;
}

/** Keep frame prices in sync when defaults change */
export function applyFramePrices(products: Product[]): Product[] {
  return products.map((product) => {
    if (
      product.category === "Magnetic Frames" &&
      product.size in FRAME_PRICES
    ) {
      return { ...product, unitPrice: FRAME_PRICES[product.size] };
    }
    return product;
  });
}
