import { redirect } from "next/navigation";
import { statusLabel } from "@/types/commerce";
import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { adminServerApi } from "@/lib/admin-server";
import type { AdminOrderList } from "@/types/admin";
import { AdminPageHeading } from "@/components/admin/admin-ui";
import { AdminOrderTable } from "@/components/admin/admin-order-table";
import { AdminRefresh } from "@/components/admin/admin-refresh";
export const metadata: Metadata = { title: "Orders" };
const statuses = [
  "AWAITING_APPROVAL",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "REJECTED",
  "CANCELLED",
];
const paymentStatuses = [
  "UNPAID",
  "PENDING_VERIFICATION",
  "PAID",
  "REFUND_REQUIRED",
  "REFUNDED",
];
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const text = (key: string) =>
    typeof raw[key] === "string" ? (raw[key] as string) : "";
  const status = statuses.includes(text("status")) ? text("status") : "";
  const paymentStatus = paymentStatuses.includes(text("paymentStatus"))
    ? text("paymentStatus")
    : "";
  const q = text("q").trim().slice(0, 100);
  const page = Math.max(
    1,
    Math.min(100000, Number.parseInt(text("page"), 10) || 1),
  );
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  if (paymentStatus) params.set("paymentStatus", paymentStatus);
  if (q) params.set("q", q);
  const data = await adminServerApi<AdminOrderList>(`/admin/orders?${params}`);
  const href = (next: Record<string, string>) => {
    const url = new URLSearchParams(params);
    for (const [key, value] of Object.entries(next)) {
      if (value) url.set(key, value);
      else url.delete(key);
    }
    return `/admin/orders?${url}`;
  };
  const lastPage = Math.max(1, Math.ceil(data.total / data.pageSize));
  if (page > lastPage) redirect(href({ page: String(lastPage) }));
  const tabs = [
    { label: "All orders", status: "", paymentStatus: "" },
    {
      label: "Awaiting approval",
      status: "AWAITING_APPROVAL",
      paymentStatus: "",
    },
    { label: "Accepted", status: "CONFIRMED", paymentStatus: "" },
    {
      label: "Payment review",
      status: "",
      paymentStatus: "PENDING_VERIFICATION",
    },
    { label: "Shipped", status: "SHIPPED", paymentStatus: "" },
    { label: "Delivered", status: "DELIVERED", paymentStatus: "" },
  ];
  return (
    <>
      <AdminPageHeading
        eyebrow="ORDER MANAGEMENT"
        title="Every order, taken care of."
        description="Review requests, track fulfillment, and keep your customers moving."
      >
        <AdminRefresh label="Refresh orders" />
      </AdminPageHeading>
      <nav className="ad-filter-tabs" aria-label="Filter orders">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={href({
              status: tab.status,
              paymentStatus: tab.paymentStatus,
              page: "1",
            })}
            className={`ad-filter-tab ${status === tab.status && paymentStatus === tab.paymentStatus ? "is-active" : ""}`}
            aria-current={
              status === tab.status && paymentStatus === tab.paymentStatus
                ? "page"
                : undefined
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <section className="ad-card">
        <div className="ad-order-tools">
          <form
            key={`search-${params}`}
            action="/admin/orders"
            className="ad-search"
          >
            <Search size={14} />
            <input
              className="ad-input"
              type="search"
              name="q"
              aria-label="Search orders"
              placeholder="Search orders, names, email or phone…"
              defaultValue={q}
              maxLength={100}
            />
            {status && <input type="hidden" name="status" value={status} />}
            {paymentStatus && (
              <input type="hidden" name="paymentStatus" value={paymentStatus} />
            )}
            <button className="ad-button ad-button--secondary" type="submit">
              Search
            </button>
          </form>
          <form
            key={`filter-${params}`}
            action="/admin/orders"
            className="ad-status-filter"
          >
            <select
              aria-label="Order status"
              name="status"
              defaultValue={status}
              className="ad-input"
            >
              <option value="">All statuses</option>
              {statuses.map((value) => (
                <option key={value} value={value}>
                  {statusLabel(value)}
                </option>
              ))}
            </select>
            {q && <input type="hidden" name="q" value={q} />}
            {paymentStatus && (
              <input type="hidden" name="paymentStatus" value={paymentStatus} />
            )}
            <button type="submit" className="ad-button ad-button--secondary">
              Filter
            </button>
          </form>
          <span className="ad-order-count">
            {data.total.toLocaleString("en-IN")}{" "}
            {data.total === 1 ? "order" : "orders"}
            {q && " found"}
          </span>
        </div>
        <AdminOrderTable
          orders={data.orders}
          filtered={Boolean(status || paymentStatus || q)}
        />
        <div className="ad-pagination">
          <span>
            {data.total
              ? `${(page - 1) * data.pageSize + 1}–${Math.min(page * data.pageSize, data.total)} of ${data.total} orders`
              : "No orders to display"}
          </span>
          <div>
            <Link
              aria-disabled={page === 1}
              tabIndex={page === 1 ? -1 : undefined}
              className={`ad-button ad-button--secondary ${page === 1 ? "ad-disabled-link" : ""}`}
              href={href({ page: String(page - 1) })}
            >
              Previous
            </Link>
            <Link
              aria-disabled={page * data.pageSize >= data.total}
              tabIndex={page * data.pageSize >= data.total ? -1 : undefined}
              className={`ad-button ad-button--secondary ${page * data.pageSize >= data.total ? "ad-disabled-link" : ""}`}
              href={href({ page: String(page + 1) })}
            >
              Next
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
