"use client";
import { usePathname } from "next/navigation";
export function StorefrontFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const page =
    path === "/"
      ? "home"
      : path.startsWith("/product/")
        ? "product"
        : "standard";
  return (
    <div className="storefront" data-store-page={page}>
      {children}
    </div>
  );
}
