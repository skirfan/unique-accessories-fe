"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";
import { toast } from "sonner";
interface WishlistState {
  productIds: string[];
  ownerId: string | null;
  connected: boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  has: (id: string) => boolean;
  clear: () => void;
  connect: (ownerId: string | null) => Promise<void>;
}
let connecting: Promise<void> | null = null;
let queue = Promise.resolve();
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => {
      const save = (id: string, remove: boolean) => {
        const owner = get().ownerId;
        if (!owner) return;
        queue = queue.then(async () => {
          if (get().ownerId !== owner) return;
          try {
            await api(`/account/wishlist/${encodeURIComponent(id)}`, {
              method: remove ? "DELETE" : "PUT",
            });
          } catch {
            toast.error("Could not save your wishlist. Please retry.");
            set((s) => ({
              productIds: remove
                ? [...new Set([...s.productIds, id])]
                : s.productIds.filter((p) => p !== id),
            }));
          }
        });
      };
      return {
        productIds: [],
        ownerId: null,
        connected: false,
        toggle: (id) => {
          const remove = get().has(id);
          set((s) => ({
            productIds: remove
              ? s.productIds.filter((p) => p !== id)
              : [...s.productIds, id],
          }));
          save(id, remove);
        },
        remove: (id) => {
          set((s) => ({ productIds: s.productIds.filter((p) => p !== id) }));
          save(id, true);
        },
        has: (id) => get().productIds.includes(id),
        clear: () => {
          const ids = get().productIds;
          set({ productIds: [] });
          ids.forEach((id) => save(id, true));
        },
        connect: async (owner) => {
          const pending = (connecting ?? Promise.resolve())
            .catch(() => {})
            .then(async () => {
              await queue;
              if (!owner) {
                if (get().ownerId) set({ productIds: [], ownerId: null });
                set({ connected: true });
                return;
              }
              const current = get();
              const merge = !current.ownerId ? current.productIds : [];
              if (current.ownerId && current.ownerId !== owner)
                set({ productIds: [] });
              const data = merge.length
                ? await api<{ productIds: string[] }>(
                    "/account/wishlist/merge",
                    {
                      method: "POST",
                      body: JSON.stringify({ productIds: merge.slice(0, 100) }),
                    },
                  )
                : await api<{ productIds: string[] }>("/account/wishlist");
              set({
                productIds: data.productIds,
                ownerId: owner,
                connected: true,
              });
            });
          connecting = pending;
          return pending.finally(() => {
            if (connecting === pending) connecting = null;
          });
        },
      };
    },
    {
      name: "ua-wishlist",
      partialize: (s) => ({ productIds: s.productIds, ownerId: s.ownerId }),
    },
  ),
);
