import { CustomerProvider } from "@/components/providers/customer-provider";
import { CatalogProvider } from "@/components/providers/catalog-provider";
import { getCatalogSnapshot } from "@/lib/server-catalog";
import { StorefrontFrame } from "@/components/layout/storefront-frame";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./storefront.css";
import { Toaster } from "sonner";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const snapshot = await getCatalogSnapshot();
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo-icon.png`,
      slogan: "Smart Accessories. Better Life.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];
  return (
    <CatalogProvider snapshot={snapshot}>
      <CustomerProvider>
        <StorefrontFrame>
          {structuredData.map((data, index) => (
            <script
              key={index}
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
              }}
            />
          ))}
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <MobileBottomNav />
          <Toaster position="bottom-center" richColors closeButton />
        </StorefrontFrame>
      </CustomerProvider>
    </CatalogProvider>
  );
}
