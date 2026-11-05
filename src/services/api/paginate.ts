import type { ApiMeta } from "@/lib/api-client";

/** Page size used when a screen needs the whole list. */
export const PAGE_LIMIT = 100;
/** Safety stop so a misbehaving API can never make us loop forever. */
const MAX_PAGES = 20;

/** Reads every page of a paginated endpoint and returns the combined items. */
export async function fetchAll<T>(load: (page: number, limit: number) => Promise<{ items: T[]; meta?: ApiMeta }>): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { items, meta } = await load(page, PAGE_LIMIT);
    all.push(...items);
    if (!meta || page >= meta.totalPages || items.length === 0) break;
  }
  return all;
}
