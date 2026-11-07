import type { Metadata } from "next";
import { OrderDetails } from "@/components/orders/order-details";
export const metadata: Metadata = {
  title: "Your Order",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  return (
    <div className="container-app max-w-4xl py-10">
      <OrderDetails key={reference} reference={reference} />
    </div>
  );
}
