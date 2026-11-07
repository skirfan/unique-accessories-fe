import Link from "next/link";
import { ArrowUpRight, MessageCircle, ShoppingBag } from "lucide-react";
import { getCatalog } from "@/lib/server-catalog";
export async function Footer() {
  const { getCategories, getSubcategories, settings } = await getCatalog();
  return (
    <footer className="premium-footer border-t border-navy-100 bg-navy-50 text-navy-600">
      <div className="container-app grid gap-9 py-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="store-wordmark">
            <span className="store-wordmark-icon">
              <ShoppingBag size={22} />
            </span>
            <span>
              Unique<strong>Accessories</strong>
            </span>
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-7 text-navy-500">
            Thoughtful accessories for your phone, your car, and the everyday in
            between.
          </p>
          {settings.whatsappNumber && (
            <a
              className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-accent-600"
              href={`https://wa.me/${settings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} /> Chat with our team{" "}
              <ArrowUpRight size={14} />
            </a>
          )}
        </div>
        {getCategories().map((category) => (
          <div key={category.id}>
            <h3 className="text-sm font-semibold text-navy-900">
              {category.name}
            </h3>
            <ul className="mt-4 space-y-3 text-xs">
              <li>
                <Link
                  href={`/category/${category.slug}`}
                  className="hover:text-accent-600"
                >
                  Shop all
                </Link>
              </li>
              {getSubcategories(category.slug)
                .slice(0, 5)
                .map((sub) => (
                  <li key={sub.id}>
                    <Link
                      href={`/category/${category.slug}/${sub.slug}`}
                      className="hover:text-accent-600"
                    >
                      {sub.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <div>
          <h3 className="text-sm font-semibold text-navy-900">Here to help</h3>
          <ul className="mt-4 space-y-3 text-xs">
            {[
              { href: "/about", label: "Our story" },
              { href: "/contact", label: "Contact us" },
              { href: "/faq", label: "Questions & answers" },
              { href: "/shipping-returns", label: "Shipping & returns" },
            ].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-accent-600">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-app flex flex-col justify-between gap-4 border-t border-navy-100 py-5 text-[11px] text-navy-500 sm:flex-row">
        <p>
          © {new Date().getFullYear()} Unique Accessories. All rights reserved.
        </p>
        <div className="flex gap-5">
          <Link href="/privacy">Privacy policy</Link>
          <Link href="/terms">Terms of service</Link>
        </div>
      </div>
    </footer>
  );
}
