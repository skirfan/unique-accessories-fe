"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * True only after the component has mounted on the client. Use this to gate
 * rendering of anything derived from a zustand `persist` store (cart/wishlist
 * counts, wishlist heart fill state, ...) so the first client render matches
 * what's actually in localStorage instead of flashing the pre-hydration
 * default and then jumping to the real value.
 *
 * Built on useSyncExternalStore rather than a `useEffect` + `setState` —
 * React re-renders once the client snapshot differs from the server one,
 * which is exactly this "has it mounted yet" case, without the extra
 * effect-triggered render pass.
 */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
