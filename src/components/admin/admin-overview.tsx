"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Checkbox, Menu } from "@mantine/core";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Boxes,
  CheckCheck,
  CircleDollarSign,
  Download,
  Lightbulb,
  MoreHorizontal,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { AdminOverview as Overview } from "@/types/admin";
import { StatusBadge } from "./admin-ui";
import { AdminRevenueChart, Sparkline } from "./admin-revenue-chart";
function Change({
  value,
  points = false,
}: {
  value: number | null;
  points?: boolean;
}) {
  return value === null ? (
    <span className="neu-no-comparison">No previous data</span>
  ) : (
    <>
      <span className={`neu-change ${value < 0 ? "is-negative" : ""}`}>
        {value < 0 ? <ArrowDown size={13} /> : <ArrowUp size={13} />}{" "}
        {Math.abs(value).toFixed(1).replace(/\.0$/, "")}
        {points ? " pts" : "%"}
      </span>
      <span className="neu-comparison-caption">vs previous period</span>
    </>
  );
}
function RecentOrders({ orders }: { orders: Overview["recentOrders"] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const selectedRows = orders.filter((o) => selected.includes(o.reference));
  function exportSelected() {
    const safe = (value: unknown) => {
      let s = String(value);
      if (/^[=+@\-\t\r]/.test(s)) s = `'${s}`;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = [
      ["Order", "Customer", "Items", "Total INR", "Status", "Date"],
      ...selectedRows.map((o) => [
        o.reference,
        o.customerName,
        o.itemCount,
        o.total,
        o.status,
        o.createdAt,
      ]),
    ];
    const blob = new Blob(
      ["\uFEFF", rows.map((row) => row.map(safe).join(",")).join("\r\n")],
      { type: "text/csv;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "unique-accessories-orders.csv";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <section className="neu-panel neu-recent-orders">
      <div className="neu-panel-heading">
        <h2>Recent Orders</h2>
        {selectedRows.length ? (
          <button className="neu-small-button" onClick={exportSelected}>
            <Download size={13} /> Export {selectedRows.length} selected
          </button>
        ) : (
          <Link className="neu-small-button" href="/admin/orders">
            View all orders <ArrowRight size={14} />
          </Link>
        )}
      </div>
      <div className="ad-table-wrap">
        <table className="neu-orders-table">
          <thead>
            <tr>
              <th>
                {orders.length > 0 && (
                  <Checkbox
                    size="xs"
                    aria-label="Select all recent orders"
                    checked={selectedRows.length === orders.length}
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < orders.length
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked ? orders.map((o) => o.reference) : [],
                      )
                    }
                  />
                )}
              </th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>
                <span className="ad-sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, index) => (
              <tr
                key={o.reference}
                className={selected.includes(o.reference) ? "is-selected" : ""}
              >
                <td>
                  <Checkbox
                    size="xs"
                    aria-label={`Select order ${o.reference}`}
                    checked={selected.includes(o.reference)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, o.reference]
                          : selected.filter((ref) => ref !== o.reference),
                      )
                    }
                  />
                </td>
                <td>
                  <Link
                    className="neu-order-reference"
                    title={o.reference}
                    aria-label={`Open order ${o.reference}`}
                    href={`/admin/orders/${o.reference}`}
                  >
                    #{o.reference.slice(-8)}
                  </Link>
                </td>
                <td>
                  <div className="neu-customer">
                    <span
                      className={`neu-customer-avatar neu-avatar-${index % 4}`}
                    >
                      {o.customerName.charAt(0).toUpperCase()}
                    </span>
                    <span>{o.customerName}</span>
                  </div>
                </td>
                <td>
                  {o.itemCount} {o.itemCount === 1 ? "item" : "items"}
                </td>
                <td>{formatPrice(o.total)}</td>
                <td>
                  <StatusBadge value={o.status} />
                </td>
                <td>
                  {new Date(o.createdAt).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td>
                  <Menu position="bottom-end" width={185}>
                    <Menu.Target>
                      <button
                        className="neu-row-menu"
                        aria-label={`Actions for order ${o.reference}`}
                      >
                        <MoreHorizontal size={19} />
                      </button>
                    </Menu.Target>
                    <Menu.Dropdown className="neu-popover">
                      <Menu.Item
                        component={Link}
                        href={`/admin/orders/${o.reference}`}
                      >
                        View order
                      </Menu.Item>
                      <Menu.Item
                        component={Link}
                        href={`/admin/orders?q=${encodeURIComponent(o.customerPhone)}`}
                      >
                        View customer’s orders
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length && (
          <div className="neu-orders-empty">
            <span className="neu-empty-icon">
              <ShoppingCart size={25} />
            </span>
            <h3>Your next order starts here</h3>
            <p>New order requests will appear here, ready for your review.</p>
            <Link href="/" target="_blank" className="neu-text-link">
              Visit your store <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
export function AdminOverview({ data }: { data: Overview }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const d = data.dashboard;
  const revenues = d.revenueActivity.map((day) => day.revenue);
  const orderSeries = d.revenueActivity.map((day) => day.orders);
  const periods = [
    { days: 7, label: "Last 7 days" },
    { days: 30, label: "Last 30 days" },
    { days: 180, label: "Last 6 months" },
    { days: 365, label: "Last year" },
  ];
  return (
    <div className="neu-dashboard" aria-busy={pending}>
      <div className="neu-metric-grid">
        <section className="neu-panel neu-metric neu-metric-green">
          <span className="neu-metric-icon">
            <CircleDollarSign size={29} />
          </span>
          <div className="neu-metric-copy">
            <h2>Total Revenue</h2>
            <strong>{formatPrice(d.revenue)}</strong>
            <div className="neu-metric-foot">
              <Change value={d.revenueChange} />
            </div>
          </div>
          <Sparkline values={revenues} color="#12b981" />
        </section>
        <section className="neu-panel neu-metric neu-metric-blue">
          <span className="neu-metric-icon">
            <ShoppingCart size={29} />
          </span>
          <div className="neu-metric-copy">
            <h2>Total Orders</h2>
            <strong>{d.orderCount.toLocaleString("en-IN")}</strong>
            <div className="neu-metric-foot">
              <Change value={d.orderChange} />
            </div>
          </div>
          <Sparkline values={orderSeries} color="#2875ff" />
        </section>
        <section className="neu-panel neu-metric neu-metric-purple">
          <span className="neu-metric-icon">
            <Package size={29} />
          </span>
          <div className="neu-metric-copy">
            <h2>Products</h2>
            <strong>{d.products.toLocaleString("en-IN")}</strong>
            <div className="neu-metric-foot">
              <span className="neu-live-count">
                <CheckCheck size={13} />
                {d.publishedProducts} published
              </span>
              <span className="neu-comparison-caption">Live catalog</span>
            </div>
          </div>
          <span className="neu-metric-decor">
            <Boxes size={46} strokeWidth={1} />
          </span>
        </section>
        <section className="neu-panel neu-metric neu-metric-orange">
          <span className="neu-metric-icon">
            <Users size={29} />
          </span>
          <div className="neu-metric-copy">
            <h2>Acceptance Rate</h2>
            <strong>
              {d.acceptanceRate === null
                ? "—"
                : `${d.acceptanceRate.toFixed(1)}%`}
            </strong>
            <div className="neu-metric-foot">
              {d.acceptanceRate === null ? (
                <span className="neu-no-comparison">No order requests yet</span>
              ) : (
                <Change value={d.acceptanceChange} points />
              )}
            </div>
          </div>
          <span className="neu-metric-decor">
            <CheckCheck size={44} strokeWidth={1.3} />
          </span>
        </section>
      </div>
      <div className="neu-dashboard-grid">
        <section className="neu-panel neu-revenue-panel">
          <div className="neu-panel-heading">
            <h2>Revenue Overview</h2>
            <div
              className="neu-periods"
              role="group"
              aria-label="Revenue period"
            >
              {periods.map((period) => (
                <button
                  key={period.days}
                  className={d.days === period.days ? "is-active" : ""}
                  aria-pressed={d.days === period.days}
                  disabled={pending}
                  onClick={() =>
                    startTransition(() =>
                      router.replace(`/admin?days=${period.days}`, {
                        scroll: false,
                      }),
                    )
                  }
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>
          <div className="neu-revenue-summary">
            <div>
              <strong>{formatPrice(d.revenue)}</strong>
              {d.revenueChange !== null && (
                <span
                  className={`neu-change ${d.revenueChange < 0 ? "is-negative" : ""}`}
                >
                  {d.revenueChange < 0 ? (
                    <ArrowDown size={13} />
                  ) : (
                    <ArrowUp size={13} />
                  )}{" "}
                  {Math.abs(d.revenueChange).toFixed(1)}%
                </span>
              )}
            </div>
            <p>
              Recorded payments · {d.orderCount.toLocaleString("en-IN")} order{" "}
              {d.orderCount === 1 ? "request" : "requests"} in this period
            </p>
          </div>
          <AdminRevenueChart key={d.days} activity={d.revenueActivity} />
          <p className="neu-chart-footnote">
            Payments currently marked paid · Asia/Kolkata
          </p>
        </section>
        <section className="neu-panel neu-top-products">
          <div className="neu-panel-heading">
            <h2>Top Products</h2>
            <Link href="/admin/products" className="neu-small-button">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {d.topProducts.length ? (
            <div className="neu-top-product-list">
              {d.topProducts.map((p, index) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}`}
                  className="neu-top-product"
                >
                  <span className="neu-top-product-image">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt=""
                        width={52}
                        height={52}
                        unoptimized
                      />
                    ) : (
                      <Package size={26} />
                    )}
                  </span>
                  <span className="neu-top-product-details">
                    <strong>{p.name}</strong>
                    <small>{p.sold.toLocaleString("en-IN")} sold</small>
                  </span>
                  <span className="neu-top-product-sales">
                    <b>{formatPrice(p.revenue)}</b>
                    <span className="neu-product-meter">
                      <i
                        style={{
                          width: `${Math.max(5, (p.revenue / Math.max(1, d.topProducts[0].revenue)) * 100)}%`,
                          background: [
                            "#5c99ff",
                            "#22be8b",
                            "#a177ff",
                            "#ffa132",
                            "#f36baf",
                          ][index],
                        }}
                      />
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="neu-products-empty">
              <span className="neu-empty-icon neu-empty-purple">
                <Package size={27} />
              </span>
              <h3>Meet your next bestsellers</h3>
              <p>Your top products will appear as orders are accepted.</p>
              <Link href="/admin/products" className="neu-text-link">
                Explore your catalog <ArrowRight size={14} />
              </Link>
            </div>
          )}
          <p className="neu-product-footnote">
            Accepted orders · Merchandise sales before discounts
          </p>
        </section>
        <RecentOrders orders={data.recentOrders} />
        <section className="neu-panel neu-growth-card">
          <div className="neu-growth-main">
            <div className="neu-growth-copy">
              <h2>Your next bestsellers</h2>
              <p>
                Keep your collection up to date.
                <br />
                Manage products, stock and availability.
              </p>
              <Link href="/admin/products/new" className="neu-primary-button">
                Add a product <ArrowRight size={16} />
              </Link>
            </div>
            <span className="classic-catalog-icon" aria-hidden="true">
              <Package size={48} strokeWidth={1.25} />
            </span>
          </div>
          <div className="neu-growth-features">
            <Link href="/admin/products">
              <span className="neu-feature-purple">
                <BarChart3 size={18} />
              </span>
              More products
            </Link>
            <Link href="/admin/inventory">
              <span className="neu-feature-orange">
                <Lightbulb size={18} />
              </span>
              Stock insights
            </Link>
            <Link href="/admin/orders">
              <span className="neu-feature-blue">
                <Users size={18} />
              </span>
              Happy customers
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
