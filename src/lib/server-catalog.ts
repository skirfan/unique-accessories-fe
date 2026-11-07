import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { createCatalog, type CatalogSnapshot } from "@/lib/data";
export const getCatalogSnapshot = cache(async (): Promise<CatalogSnapshot> => {
  await connection();
  const response = await fetch(
    `${process.env.API_URL ?? "http://localhost:4000"}/catalog`,
    { cache: "no-store", signal: AbortSignal.timeout(10000) },
  );
  if (!response.ok)
    throw new Error(
      "The catalog is temporarily unavailable. Please try again.",
    );
  return response.json();
});
export const getCatalog = cache(async () =>
  createCatalog(await getCatalogSnapshot()),
);
