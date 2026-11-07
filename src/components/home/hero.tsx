import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function Hero() {
  return (
    <section className="premium-hero">
      <Image
        className="premium-hero-art"
        src="/storefront/premium-hero.png"
        alt=""
        fill
        sizes="100vw"
        preload
      />
      <div className="premium-hero-shade" />
      <div className="container-app premium-hero-content">
        <span className="premium-label">Premium Accessories</span>
        <h1>
          Elevate
          <br />
          Your Everyday
        </h1>
        <p>
          Unique accessories for your mobile devices
          <br className="hidden sm:block" /> and your drive. Style. Function.
          Uniquely Yours.
        </p>
        <Link href="/products" className="premium-gold-button">
          Shop Now <ArrowRight size={16} />
        </Link>
      </div>
      <div className="premium-hero-caption">
        <span>DESIGNED FOR THE EVERYDAY.</span>
        <span>MADE TO GO FURTHER.</span>
      </div>
    </section>
  );
}
