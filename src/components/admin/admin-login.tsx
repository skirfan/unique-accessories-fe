"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordInput, TextInput } from "@mantine/core";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Moon,
  ShoppingBag,
  Sun,
} from "lucide-react";
import { z } from "zod";
import { adminApi } from "@/lib/admin-api";
import { AdminButton } from "./admin-ui";
import { useAdminAppearance } from "./admin-provider";
const credentials = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Enter your password.").max(200),
});
export function AdminLogin({ expired = false }: { expired?: boolean }) {
  const router = useRouter();
  const appearance = useAdminAppearance();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = credentials.safeParse({
      email: form.get("email"),
      password: form.get("password"),
    });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError("");
    setBusy(true);
    try {
      await adminApi("/admin/login", {
        method: "POST",
        body: JSON.stringify(result.data),
      });
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not sign in. Please try again.",
      );
      setBusy(false);
    }
  }
  return (
    <div className="classic-login">
      <div className="classic-login-bar">
        <Link href="/" className="classic-login-back">
          <ArrowLeft size={16} /> Back to store
        </Link>
        <button
          className="neu-round-button"
          onClick={appearance.toggleScheme}
          aria-label={`Switch to ${appearance.scheme === "light" ? "dark" : "light"} theme`}
        >
          {appearance.scheme === "light" ? (
            <Moon size={18} />
          ) : (
            <Sun size={18} />
          )}
        </button>
      </div>
      <main className="classic-login-content">
        <Link href="/" className="classic-login-brand">
          <span>
            <ShoppingBag size={22} />
          </span>
          <strong>Unique Accessories</strong>
        </Link>
        <section className="classic-login-card" aria-labelledby="login-title">
          <div className="classic-login-icon">
            <LockKeyhole size={23} strokeWidth={1.7} />
          </div>
          <p className="ad-eyebrow">STORE ADMINISTRATION</p>
          <h1 id="login-title">Welcome back</h1>
          <p className="classic-login-intro">Sign in to manage your store.</p>
          {expired && (
            <p role="status" className="ad-alert">
              Your session has expired. Sign in to continue.
            </p>
          )}
          <form onSubmit={signIn}>
            <TextInput
              label="Admin email"
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="you@yourstore.com"
              disabled={busy}
            />
            <PasswordInput
              size="md"
              label="Password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              disabled={busy}
              visibilityToggleButtonProps={{
                "aria-label": "Toggle password visibility",
              }}
            />
            {error && (
              <p role="alert" className="ad-alert ad-alert--error">
                {error}
              </p>
            )}
            <AdminButton
              type="submit"
              busy={busy}
              className="classic-login-submit"
            >
              {busy ? "Signing in…" : "Sign in to workspace"}
              {!busy && <ArrowRight size={16} />}
            </AdminButton>
          </form>
          <p className="classic-login-note">
            <LockKeyhole size={13} /> Authorized store administrators only
          </p>
        </section>
        <p className="classic-login-copyright">
          © {new Date().getFullYear()} Unique Accessories
        </p>
      </main>
    </div>
  );
}
