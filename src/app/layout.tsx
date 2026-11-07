import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Smart Accessories, Better Life`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Premium mobile and car accessories — covers, earphones, chargers, power banks, dash cams and mounts, matched to your exact phone or car model.",
  keywords: [
    "mobile accessories",
    "car accessories",
    "phone covers",
    "car mounts",
    "wireless earbuds",
    "dash cam",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Smart Accessories, Better Life`,
    description:
      "Premium mobile and car accessories, matched to your exact phone or car model.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Smart Accessories, Better Life`,
    description:
      "Premium mobile and car accessories, matched to your exact phone or car model.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
