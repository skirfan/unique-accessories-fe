"use client";
import { api, ApiError } from "@/lib/api";
export async function adminApi<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  try {
    return await api<T>(path, options);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 401 &&
      path !== "/admin/login"
    )
      window.location.assign(
        new URL("/admin/login?expired=1", window.location.origin).href,
      );
    throw error;
  }
}
