import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";

export const getAdminSession = cache(
  async (): Promise<{ email: string } | null> => {
    const token = (await cookies()).get("ua_admin")?.value;
    if (!token) return null;
    const response = await fetch(
      `${process.env.API_URL ?? "http://localhost:4000"}/admin/session`,
      {
        headers: { Cookie: `ua_admin=${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
    if (response.status === 401) return null;
    if (!response.ok)
      throw new Error(
        "Admin access is temporarily unavailable. Please try again.",
      );
    return response.json();
  },
);
export async function requireAdminSession() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
export async function adminServerApi<T>(path: string): Promise<T> {
  await requireAdminSession();
  const token = (await cookies()).get("ua_admin")!.value;
  const response = await fetch(
    `${process.env.API_URL ?? "http://localhost:4000"}${path}`,
    {
      headers: { Cookie: `ua_admin=${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    },
  );
  if (response.status === 401) redirect("/admin/login");
  if (response.status === 404) notFound();
  if (!response.ok)
    throw new Error("Could not load your store data. Please try again.");
  return response.json();
}
