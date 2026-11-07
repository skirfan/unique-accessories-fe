import { formatPrice } from "@/lib/utils";
import { statusLabel, type Order } from "@/types/commerce";
export function OrderSummary({ order }: { order: Order }) {
  const a = order.shippingAddress;
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-navy-50 p-4">
          <p className="text-xs text-navy-500">Order status</p>
          <p className="mt-1 font-semibold">{statusLabel(order.status)}</p>
        </div>
        <div className="rounded-xl bg-navy-50 p-4">
          <p className="text-xs text-navy-500">Payment</p>
          <p className="mt-1 font-semibold">
            {order.paymentMethod} · {statusLabel(order.paymentStatus)}
          </p>
        </div>
        <div className="rounded-xl bg-navy-50 p-4">
          <p className="text-xs text-navy-500">Order total</p>
          <p className="mt-1 font-semibold">{formatPrice(order.total)}</p>
        </div>
      </div>
      <section className="rounded-2xl border border-navy-100 p-5">
        <h2 className="font-display font-bold">Order items</h2>
        <ul className="mt-4 divide-y divide-navy-100">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4 py-3 text-sm">
              <span>
                {item.productName}
                <span className="mt-1 block text-xs text-navy-500">
                  {item.variantLabel} · Qty {item.quantity} · {item.sku}
                </span>
              </span>
              <span className="shrink-0">
                {formatPrice(item.unitPrice * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="ml-auto mt-4 max-w-xs space-y-2 border-t border-navy-100 pt-4 text-sm">
          {[
            ["Subtotal", order.subtotal],
            ["Discount", -order.discount],
            ["Shipping", order.shippingFee],
            ["Total", order.total],
          ].map(([label, amount]) => (
            <div key={label} className="flex justify-between">
              <dt>{label}</dt>
              <dd className="font-semibold">{formatPrice(Number(amount))}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-2xl border border-navy-100 p-5">
        <h2 className="font-display font-bold">Delivery details</h2>
        <p className="mt-3 text-sm leading-6">
          {order.customerName}
          <br />
          {a.line1}
          {a.line2 && <>, {a.line2}</>}
          <br />
          {a.city}, {a.state} — {a.pincode}
          <br />
          {order.customerPhone}
          <br />
          {order.customerEmail}
        </p>
        {order.trackingNumber && (
          <p className="mt-3 text-sm font-semibold">
            Tracking number: {order.trackingNumber}
          </p>
        )}
      </section>
      {order.shipment && (
        <section className="rounded-2xl border border-navy-100 p-5">
          <h2 className="font-display font-bold">Shipping with Shiprocket</h2>
          <p className="mt-3 text-sm">
            {statusLabel(order.shipment.state)}
            {order.shipment.courierName
              ? ` · ${order.shipment.courierName}`
              : ""}
          </p>
          {order.shipment.awb && (
            <p className="mt-2 text-sm">AWB: {order.shipment.awb}</p>
          )}
          {order.shipment.trackingUrl && (
            <a
              className="mt-3 inline-block underline"
              href={order.shipment.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Track delivery
            </a>
          )}
        </section>
      )}
      <section className="rounded-2xl border border-navy-100 p-5">
        <h2 className="font-display font-bold">Order updates</h2>
        <ol className="mt-4 space-y-4">
          {order.history.map((entry, i) => (
            <li key={i} className="border-l-2 border-accent-300 pl-4">
              <p className="text-sm font-semibold">
                {statusLabel(entry.status)}
              </p>
              <p className="mt-1 text-sm text-navy-600">{entry.note}</p>
              <time className="mt-1 block text-xs text-navy-400">
                {new Date(entry.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
