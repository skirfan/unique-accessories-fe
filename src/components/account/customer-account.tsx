"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, LogOut, Package, ArrowRight } from "lucide-react";
import { useCustomer } from "@/components/providers/customer-provider";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { statusLabel, type Order } from "@/types/commerce";
export function CustomerAccount() {
  const { user, loading, error: sessionError, logout, refresh } = useCustomer(),
    router = useRouter();
  const [page, setPage] = useState(1),
    [data, setData] = useState<{
      orders: Order[];
      total: number;
      page: number;
      pageSize: number;
    } | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    api<NonNullable<typeof data>>(`/account/orders?page=${page}`, {
      signal: controller.signal,
    })
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [user, page]);
  if (loading) return <p role="status">Loading your account…</p>;
  if (!user)
    return (
      <div className="customer-account-empty">
        <Package size={36} />
        <h1>Your orders, together</h1>
        <p>
          Sign in to view orders placed with your account and your saved
          wishlist.
        </p>
        {sessionError && <p role="alert">{sessionError}</p>}
        <Link href="/login" className="premium-gold-button">
          Sign in with Google
        </Link>
        {sessionError && (
          <button onClick={() => void refresh()}>Try again</button>
        )}
      </div>
    );
  return (
    <>
      <div className="customer-account-heading">
        <div>
          <span className="store-eyebrow">MY ACCOUNT</span>
          <h1>Hello, {user.name?.split(" ")[0] ?? "there"}</h1>
          <p>{user.email}</p>
        </div>
        <button
          className="customer-account-signout"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await logout();
              router.push("/login");
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not sign out.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
      <div className="customer-account-links">
        <Link href="/account">
          <Package size={20} />
          My orders
        </Link>
        <Link href="/wishlist">
          <Heart size={20} />
          My wishlist
          <ArrowRight size={15} />
        </Link>
      </div>
      {error && (
        <p role="alert" className="customer-account-error">
          {error}
        </p>
      )}
      <section className="customer-orders">
        <h2>Your orders</h2>
        <p className="customer-account-help">
          Guest orders can be added from their private order link when the order
          email matches your Google account.
        </p>
        {!data ? (
          <p role="status">Loading orders…</p>
        ) : !data.orders.length ? (
          <div className="customer-account-empty">
            <Package size={30} />
            <h3>Your next favourite is waiting</h3>
            <p>Orders placed while signed in will appear here.</p>
            <Link href="/products" className="premium-gold-button">
              Explore the shop
            </Link>
          </div>
        ) : (
          data.orders.map((order) => (
            <Link
              key={order.reference}
              className="customer-order-card"
              href={`/orders/${order.reference}`}
            >
              <div>
                <strong>{order.reference}</strong>
                <time>
                  {new Date(order.createdAt).toLocaleDateString("en-IN")}
                </time>
              </div>
              <span
                className={`customer-order-state is-${order.status.toLowerCase()}`}
              >
                {statusLabel(order.status)}
              </span>
              <div>
                <p>
                  {order.items
                    .map((i) => `${i.productName} × ${i.quantity}`)
                    .join(", ")}
                </p>
                <small>
                  {order.paymentMethod} · {statusLabel(order.paymentStatus)}
                </small>
              </div>
              <strong>{formatPrice(order.total)}</strong>
              <ArrowRight size={17} />
            </Link>
          ))
        )}
        {data && data.total > data.pageSize && (
          <div className="customer-account-pagination">
            <button
              disabled={page === 1}
              onClick={() => {
                setData(null);
                setPage((p) => p - 1);
              }}
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(data.total / data.pageSize)}
            </span>
            <button
              disabled={page * data.pageSize >= data.total}
              onClick={() => {
                setData(null);
                setPage((p) => p + 1);
              }}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}
