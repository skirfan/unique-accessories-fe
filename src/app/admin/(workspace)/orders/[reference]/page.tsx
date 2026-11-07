import type { Metadata } from "next";
import type { Order } from "@/types/commerce";
import { adminServerApi } from "@/lib/admin-server";
import { AdminOrderDetail } from "@/components/admin/admin-orders";
export const metadata: Metadata = { title: "Order details" };
export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const order = await adminServerApi<Order>(
    `/admin/orders/${encodeURIComponent(reference)}`,
  );
  return (
    <AdminOrderDetail
      key={`${order.reference}-${order.history.length}`}
      initial={order}
    />
  );
}
