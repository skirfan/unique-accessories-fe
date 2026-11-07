"use client";
import Image from "next/image";
import Link from "next/link";
import {
  Badge,
  Button,
  Group,
  NativeSelect,
  TextInput,
  Text,
} from "@mantine/core";
import { Package, Plus, Search } from "lucide-react";
import { AdminPageHeading } from "./admin-ui";
import { AdminRefresh } from "./admin-refresh";
import type { ProductList, Taxonomy } from "@/types/catalog-admin";
import { formatPrice } from "@/lib/utils";
export function ProductStatus({ status }: { status: string }) {
  return (
    <Badge
      variant="light"
      color={
        status === "PUBLISHED"
          ? "green"
          : status === "ARCHIVED"
            ? "gray"
            : "blue"
      }
      radius="sm"
      size="sm"
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
export function AdminProducts({
  data,
  taxonomy,
  query,
}: {
  data: ProductList;
  taxonomy: Taxonomy;
  query: { q: string; status: string; subcategoryId: string };
}) {
  const href = (page: number) =>
    `/admin/products?${new URLSearchParams({ ...query, page: String(page) })}`;
  return (
    <>
      <AdminPageHeading
        eyebrow="CATALOG"
        title="Products"
        description="Build your collection. Keep every detail in your control."
      >
        <AdminRefresh />
        <Button
          component={Link}
          href="/admin/products/new"
          leftSection={<Plus size={16} />}
        >
          Add product
        </Button>
      </AdminPageHeading>
      <section className="ad-editor-card">
        <form action="/admin/products" className="ad-catalog-toolbar">
          <TextInput
            name="q"
            aria-label="Search products"
            placeholder="Search products or SKU"
            defaultValue={query.q}
            leftSection={<Search size={16} />}
            maxLength={100}
          />
          <NativeSelect
            name="status"
            aria-label="Product status"
            defaultValue={query.status}
            data={[
              { value: "", label: "All statuses" },
              { value: "DRAFT", label: "Draft" },
              { value: "PUBLISHED", label: "Published" },
              { value: "ARCHIVED", label: "Archived" },
            ]}
          />
          <NativeSelect
            name="subcategoryId"
            aria-label="Product subcategory"
            defaultValue={query.subcategoryId}
            data={[
              { value: "", label: "All subcategories" },
              ...taxonomy.subcategories.map((s) => ({
                value: s.id,
                label: s.name,
              })),
            ]}
          />
          <Button variant="default" type="submit">
            Search
          </Button>
        </form>
      </section>
      <section className="ad-card" style={{ marginTop: 20 }}>
        <div className="ad-card-header">
          <h2>Product catalog</h2>
          <Text size="sm" c="dimmed">
            {data.total} products
          </Text>
        </div>
        {data.products.length ? (
          <div className="ad-table-wrap">
            <table className="ad-product-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Status</th>
                  <th>Price</th>
                  <th>Available stock</th>
                  <th>Variants</th>
                  <th>
                    <span className="ad-sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((p) => {
                  const active = p.variants.filter((v) => v.isActive);
                  const stock = active.reduce(
                    (n, v) =>
                      n +
                      Math.max(
                        0,
                        (v.inventory?.quantity ?? 0) -
                          (v.inventory?.reserved ?? 0),
                      ),
                    0,
                  );
                  const prices = active.map((v) => v.price);
                  return (
                    <tr key={p.id}>
                      <td>
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="ad-product-cell"
                        >
                          {p.images[0] ? (
                            <Image
                              unoptimized
                              width={48}
                              height={48}
                              src={p.images[0].thumbnailUrl ?? p.images[0].url}
                              alt=""
                            />
                          ) : (
                            <span className="ad-product-thumb">
                              <Package size={22} />
                            </span>
                          )}
                          <span>
                            <strong>{p.name}</strong>
                            <small>
                              {p.subcategory.category.name} /{" "}
                              {p.subcategory.name}
                            </small>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <ProductStatus status={p.status} />
                      </td>
                      <td>
                        {prices.length ? formatPrice(Math.min(...prices)) : "—"}
                      </td>
                      <td>
                        <Text
                          size="sm"
                          c={
                            stock === 0
                              ? "red"
                              : stock <= 5
                                ? "orange"
                                : undefined
                          }
                        >
                          {stock} units
                        </Text>
                      </td>
                      <td>{active.length} active</td>
                      <td>
                        <Button
                          component={Link}
                          href={`/admin/products/${p.id}`}
                          variant="subtle"
                          size="xs"
                        >
                          Edit product
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="ad-catalog-empty">
            <Package size={32} />
            <strong>No products found</strong>
            <p>Try another search or add your first product.</p>
            <Button component={Link} href="/admin/products/new" size="sm">
              Add product
            </Button>
          </div>
        )}
        <div className="ad-catalog-pagination">
          <Text size="sm" c="dimmed">
            Page {data.page} of {data.pages}
          </Text>
          <Group gap="xs">
            <Button
              component={Link}
              href={href(Math.max(1, data.page - 1))}
              disabled={data.page === 1}
              variant="default"
              size="xs"
            >
              Previous
            </Button>
            <Button
              component={Link}
              href={href(Math.min(data.pages, data.page + 1))}
              disabled={data.page === data.pages}
              variant="default"
              size="xs"
            >
              Next
            </Button>
          </Group>
        </div>
      </section>
    </>
  );
}
