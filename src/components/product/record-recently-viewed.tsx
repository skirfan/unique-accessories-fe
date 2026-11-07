"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/store/recently-viewed-store";

/** Renders nothing — just records that `productId` was viewed. Split out
 * from the (server) product page so only this sliver needs to be a client
 * component. */
export function RecordRecentlyViewed({ productId }: { productId: string }) {
  const record = useRecentlyViewedStore((s) => s.record);

  useEffect(() => {
    record(productId);
  }, [productId, record]);

  return null;
}
