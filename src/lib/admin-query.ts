export function readAdminQuery(
  raw: Record<string, string | string[] | undefined>,
) {
  return {
    text: (key: string) =>
      typeof raw[key] === "string"
        ? (raw[key] as string).trim().slice(0, 100)
        : "",
    page: Math.max(
      1,
      Math.min(
        100000,
        parseInt(typeof raw.page === "string" ? raw.page : "1", 10) || 1,
      ),
    ),
  };
}
