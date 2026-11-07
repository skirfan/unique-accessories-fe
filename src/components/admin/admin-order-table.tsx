import Link from "next/link";
import { ArrowUpRight, ShoppingBag } from "lucide-react";
import type { AdminOrderRow } from "@/types/admin";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "./admin-ui";
export function AdminOrderTable({
  orders,
  compact = false,
  filtered = false,
}: {
  orders: AdminOrderRow[];
  compact?: boolean;
  filtered?: boolean;
}) {
  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr>
            <th scope="col">Order reference</th>
            <th scope="col">Customer</th>
            <th scope="col">Status</th>
            {!compact && <th scope="col">Payment</th>}
            <th scope="col">Amount</th>
            <th scope="col">
              <span className="ad-sr-only">Open order</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.reference}>
              <td>
                <Link
                  href={`/admin/orders/${order.reference}`}
                  className="ad-order-ref"
                >
                  {order.reference}
                </Link>
                <small>
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </small>
              </td>
              <td>
                <div className="ad-customer-cell">
                  <span className="ad-customer-initial">
                    {order.customerName.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>{order.customerName}</strong>
                    {!compact && <small>{order.customerPhone}</small>}
                  </div>
                </div>
              </td>
              <td>
                <StatusBadge value={order.status} />
              </td>
              {!compact && (
                <td>
                  <span>
                    {order.paymentMethod === "COD" ? "Cash on delivery" : "UPI"}
                  </span>
                  <small>
                    <StatusBadge value={order.paymentStatus} />
                  </small>
                </td>
              )}
              <td className="ad-amount">{formatPrice(order.total)}</td>
              <td>
                <Link
                  href={`/admin/orders/${order.reference}`}
                  className="ad-icon-button"
                  aria-label={`Manage order ${order.reference}`}
                >
                  <ArrowUpRight size={14} />
                </Link>
              </td>
            </tr>
          ))}
          {!orders.length && (
            <tr>
              <td colSpan={compact ? 5 : 6} className="ad-table-empty">
                <div className="ad-empty">
                  <span className="ad-empty-icon">
                    <ShoppingBag size={22} />
                  </span>
                  <h2>
                    {filtered
                      ? "No matching orders"
                      : "Your next chapter starts with an order."}
                  </h2>
                  <p>
                    {filtered
                      ? "Try another search or clear the filters to see all orders."
                      : "New order requests will appear here, ready for you to review."}
                  </p>
                  {filtered && (
                    <Link href="/admin/orders" className="ad-link">
                      Clear all filters
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
