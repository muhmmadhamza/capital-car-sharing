"use client";

import { useRouter } from "next/navigation";
import type { CarSort } from "@/types/search";

export function SortSelect({ params, value }: { params: Record<string, string[]>; value: CarSort }) {
  const router = useRouter();
  return (
    <label className="inline-flex items-center gap-2 text-sm text-navy-700">
      Sort by
      <select
        value={value}
        onChange={(e) => {
          const sp = new URLSearchParams();
          for (const [k, vs] of Object.entries(params)) if (k !== "sort") vs.forEach((v) => sp.append(k, v));
          if (e.target.value !== "recommended") sp.set("sort", e.target.value);
          router.replace(`/cars${sp.size ? `?${sp}` : ""}`, { scroll: false });
        }}
        className="h-10 rounded-lg border border-navy-900/20 bg-white px-3 text-sm font-medium text-navy-900 hover:border-navy-900/40 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-gold-500/60"
      >
        <option value="recommended">Recommended</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}
