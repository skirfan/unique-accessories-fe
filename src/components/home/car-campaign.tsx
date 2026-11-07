import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
export function CarCampaign({ product = false }: { product?: boolean }) {
  return (
    <section
      className={
        product
          ? "container-app premium-campaign-wrap is-product-story"
          : "container-app premium-campaign-wrap"
      }
    >
      <div className="premium-campaign">
        <Image
          src="/storefront/premium-drive.png"
          alt=""
          fill
          sizes="(max-width: 700px) 100vw, 1200px"
        />
        <div className="premium-campaign-shade" />
        <div className="premium-campaign-copy">
          <p className="store-eyebrow">CAR ACCESSORIES</p>
          <h2>
            {product ? (
              <>
                Designed for
                <br />
                the Road Ahead
              </>
            ) : (
              <>Drive in Style</>
            )}
          </h2>
          <p>
            Smart accessories for a smoother,
            <br />
            more comfortable everyday drive.
          </p>
          <Link
            href="/category/car-accessories"
            className="premium-gold-button"
          >
            Explore Car Accessories <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
