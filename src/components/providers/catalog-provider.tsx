"use client";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { createCatalog, type CatalogSnapshot } from "@/lib/data";
const CatalogContext = createContext<ReturnType<typeof createCatalog> | null>(
  null,
);
export function CatalogProvider({
  snapshot,
  children,
}: {
  snapshot: CatalogSnapshot;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const [refreshed, setRefreshed] = useState<{
    source: CatalogSnapshot;
    data: CatalogSnapshot;
  } | null>(null);
  useEffect(() => {
    let controller: AbortController | undefined;
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      fetch("/api/catalog", { cache: "no-store", signal })
        .then((response) => {
          if (!response.ok) throw new Error("Catalog refresh unavailable");
          return response.json() as Promise<CatalogSnapshot>;
        })
        .then((data) => {
          if (!signal.aborted) setRefreshed({ source: snapshot, data });
        })
        .catch(() => {
          /* Preserve the last catalog; checkout still reviews authoritative data. */
        });
    };
    if (previousPath.current !== pathname) {
      previousPath.current = pathname;
      refresh();
    }
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller?.abort();
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [pathname, snapshot]);
  const current = refreshed?.source === snapshot ? refreshed.data : snapshot;
  const value = useMemo(() => createCatalog(current), [current]);
  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}
export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("Catalog provider is missing.");
  return catalog;
}
