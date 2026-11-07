"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useCustomer } from "@/components/providers/customer-provider";
import { UserRound, PackageCheck, Heart, ArrowRight } from "lucide-react";
export function CustomerLogin() {
  const { user, loading, googleEnabled, error, refresh } = useCustomer(),
    params = useSearchParams(),
    router = useRouter();
  const next = ["/checkout", "/wishlist"].includes(params.get("next") ?? "")
    ? params.get("next")!
    : "/account";
  const issue = params.get("error");
  return (
    <div className="customer-login">
      <div className="customer-login-story">
        <span className="store-eyebrow">YOUR UNIQUE ACCOUNT</span>
        <h1>
          All your favourites.
          <br />
          Every order.
          <br />
          One place.
        </h1>
        <p>
          Sign in securely with Google to save your wishlist across devices and
          follow your deliveries.
        </p>
        <div>
          <span>
            <Heart size={20} />A wishlist that stays with you
          </span>
          <span>
            <PackageCheck size={20} />
            Your orders and invoices
          </span>
        </div>
      </div>
      <section className="customer-login-card">
        <div className="customer-account-icon">
          <UserRound size={26} />
        </div>
        <h2>Welcome to Unique</h2>
        <p>Use your Google account to get started.</p>
        {loading ? (
          <p role="status">Checking your account…</p>
        ) : user ? (
          <>
            <p>
              Signed in as <strong>{user.email}</strong>
            </p>
            <button
              className="premium-gold-button"
              onClick={() => router.push(next)}
            >
              Continue <ArrowRight size={16} />
            </button>
          </>
        ) : googleEnabled ? (
          <a
            href={`/api/auth/google/start?returnTo=${encodeURIComponent(next)}`}
            className="customer-google-button"
          >
            <span aria-hidden="true">G</span>Continue with Google
          </a>
        ) : (
          <p className="customer-account-notice">
            Google sign-in is not available yet. You can still shop and check
            out as a guest.
          </p>
        )}
        {(error || issue) && (
          <p role="alert" className="customer-account-error">
            {error ||
              (issue === "cancelled"
                ? "Sign-in was cancelled. You can try again."
                : "Google sign-in could not be completed. Please try again.")}
          </p>
        )}
        {error && (
          <button className="underline" onClick={() => void refresh()}>
            Try again
          </button>
        )}
        <p className="customer-login-terms">
          By continuing, you agree to our <Link href="/terms">Terms</Link> and{" "}
          <Link href="/privacy">Privacy Policy</Link>.
        </p>
        <Link href="/products" className="customer-login-guest">
          Continue shopping as a guest <ArrowRight size={14} />
        </Link>
      </section>
    </div>
  );
}
