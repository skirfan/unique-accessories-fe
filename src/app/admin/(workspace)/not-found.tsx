import Link from "next/link";
import { Compass } from "lucide-react";
export default function AdminNotFound() {
  return (
    <section className="ad-card ad-empty">
      <Compass size={30} />
      <h1>This page isn’t in your workspace.</h1>
      <p>
        The order or page may have moved. Head back to your overview to
        continue.
      </p>
      <Link href="/admin" className="ad-button ad-button--primary">
        Back to overview
      </Link>
    </section>
  );
}
