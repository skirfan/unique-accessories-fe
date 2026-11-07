"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";
import { useWishlistStore } from "@/store/wishlist-store";
export type Customer = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
};
type Session = { user: Customer | null; googleEnabled: boolean };
const CustomerContext = createContext<{
  user: Customer | null;
  loading: boolean;
  googleEnabled: boolean;
  error: string;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  loading: true,
  googleEnabled: false,
  error: "",
  refresh: async () => {},
  logout: async () => {},
});
export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>({
      user: null,
      googleEnabled: false,
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const next = await api<Session>("/auth/session");
      setSession(next);
      setError("");
      await useWishlistStore.getState().connect(next.user?.id ?? null);
    } catch {
      setError(
        "Account services are temporarily unavailable. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void Promise.resolve().then(refresh);
    const focus = () => void refresh();
    window.addEventListener("focus", focus);
    return () => window.removeEventListener("focus", focus);
  }, [refresh]);
  const logout = async () => {
    await api("/auth/logout", { method: "POST" });
    await useWishlistStore.getState().connect(null);
    setSession((s) => ({ ...s, user: null }));
  };
  return (
    <CustomerContext.Provider
      value={{ ...session, loading, error, refresh, logout }}
    >
      {children}
    </CustomerContext.Provider>
  );
}
export const useCustomer = () => useContext(CustomerContext);
