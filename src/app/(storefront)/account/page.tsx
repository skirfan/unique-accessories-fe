import { CustomerAccount } from "@/components/account/customer-account";
export const metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};
export default function AccountPage() {
  return (
    <div className="container-app py-10">
      <CustomerAccount />
    </div>
  );
}
