import {
  ArrowRight,
  CheckCheck,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
export function OrderSteps() {
  return (
    <section className="container-app store-order-section">
      <div className="store-section-heading">
        <div>
          <p className="store-eyebrow">A LITTLE MORE PERSONAL</p>
          <h2>A simple way to shop.</h2>
        </div>
        <Link
          href="/faq"
          className="inline-flex items-center gap-2 text-sm font-semibold"
        >
          How it works <ArrowRight size={16} />
        </Link>
      </div>
      <div className="store-order-grid">
        {[
          {
            Icon: ShoppingBag,
            title: "Find something you love",
            description:
              "Choose your accessories, review your total and place your order.",
          },
          {
            Icon: MessageCircle,
            title: "Your order is confirmed",
            description:
              "Stock is checked when you order. Your confirmation includes items, delivery details and an invoice.",
          },
          {
            Icon: CheckCheck,
            title: "Choose how to pay",
            description:
              "Pay on delivery or complete UPI payment on your order page. Follow delivery updates from your account or private link.",
          },
        ].map(({ Icon, title, description }, index) => (
          <article key={title}>
            <div>
              <span>
                <Icon size={23} strokeWidth={1.5} />
              </span>
              <small>0{index + 1}</small>
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
