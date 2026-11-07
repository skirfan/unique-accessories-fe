"use client";
import { createContext, useContext, useState } from "react";
import type { Product } from "@/types";
const Selection = createContext<{
  variantId: string;
  setVariantId: (id: string) => void;
} | null>(null);
export function ProductSelection({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const [variantId, setVariantId] = useState(
    (product.variants.find((v) => v.stock > 0) ?? product.variants[0]).id,
  );
  return (
    <Selection.Provider value={{ variantId, setVariantId }}>
      {children}
    </Selection.Provider>
  );
}
export function useProductSelection() {
  const value = useContext(Selection);
  if (!value) throw new Error("Product selection requires a provider.");
  return value;
}
