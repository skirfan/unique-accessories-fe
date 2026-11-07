import { Suspense } from "react";
import { CustomerLogin } from "@/components/account/customer-login";
export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default function LoginPage() {
  return (
    <div className="container-app py-12">
      <Suspense fallback={<p>Loading sign in…</p>}>
        <CustomerLogin />
      </Suspense>
    </div>
  );
}
