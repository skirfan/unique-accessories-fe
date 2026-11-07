"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal, TextInput } from "@mantine/core";
import { ArrowRight, Package, Search, ShoppingCart } from "lucide-react";
import { adminApi } from "@/lib/admin-api";
import type { ProductList } from "@/types/catalog-admin";
import type { AdminOrderList } from "@/types/admin";
export function AdminSearch({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    query: string;
    products: ProductList["products"];
    orders: AdminOrderList["orders"];
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!opened || query.trim().length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      const q = query.trim();
      Promise.all([
        adminApi<ProductList>(`/admin/products?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        }),
        adminApi<AdminOrderList>(`/admin/orders?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        }),
      ])
        .then(([products, orders]) =>
          setResults({
            query: q,
            products: products.products.slice(0, 5),
            orders: orders.orders.slice(0, 5),
          }),
        )
        .catch((e) => {
          if (!controller.signal.aborted) setError(e.message);
        });
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, opened]);
  const current = results?.query === query.trim() ? results : null;
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Search your store"
      size="lg"
      centered
      closeButtonProps={{ "aria-label": "Close search" }}
      classNames={{ content: "neu-search-modal" }}
    >
      <TextInput
        data-autofocus
        aria-label="Search products, orders or customers"
        placeholder="Search products, SKUs, order references or customers…"
        value={query}
        maxLength={100}
        leftSection={<Search size={18} />}
        onChange={(e) => {
          setQuery(e.target.value);
          setError("");
        }}
      />
      <div className="neu-search-results" aria-live="polite">
        {error ? (
          <p role="alert">{error}</p>
        ) : query.trim().length < 2 ? (
          <>
            <p>Type at least 2 characters, or jump to a section.</p>
            {[
              { href: "/admin/products", label: "Products", Icon: Package },
              { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
            ].map(({ href, label, Icon }) => (
              <Link key={href} href={href} onClick={onClose}>
                <Icon size={18} />
                <span>{label}</span>
                <ArrowRight size={15} />
              </Link>
            ))}
          </>
        ) : !current ? (
          <p>Searching your store…</p>
        ) : (
          <>
            {current.products.length > 0 && (
              <>
                <h3>Products</h3>
                {current.products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/admin/products/${p.id}`}
                    onClick={onClose}
                  >
                    <Package size={18} />
                    <span>
                      <strong>{p.name}</strong>
                      <small>
                        {p.status.toLowerCase()} · {p.variants.length} variants
                      </small>
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </>
            )}
            {current.orders.length > 0 && (
              <>
                <h3>Orders & customers</h3>
                {current.orders.map((o) => (
                  <Link
                    key={o.reference}
                    href={`/admin/orders/${o.reference}`}
                    onClick={onClose}
                  >
                    <ShoppingCart size={18} />
                    <span>
                      <strong>{o.reference}</strong>
                      <small>{o.customerName}</small>
                    </span>
                    <ArrowRight size={15} />
                  </Link>
                ))}
              </>
            )}
            {!current.products.length && !current.orders.length && (
              <p>
                No matching products or orders. Try a name, SKU or order
                reference.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
