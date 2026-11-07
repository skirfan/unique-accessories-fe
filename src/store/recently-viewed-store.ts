"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_ITEMS = 8;

interface RecentlyViewedState {
  productIds: string[];
  record: (productId: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      productIds: [],
      record: (productId) => {
        set((state) => ({
          productIds: [productId, ...state.productIds.filter((id) => id !== productId)].slice(
            0,
            MAX_ITEMS
          ),
        }));
      },
    }),
    { name: "ua-recently-viewed" }
  )
);
