import { redirect } from "next/navigation";
// Legacy demo confirmations never represent a persisted order.
export default function LegacyCheckoutSuccess() {
  redirect("/checkout");
}
