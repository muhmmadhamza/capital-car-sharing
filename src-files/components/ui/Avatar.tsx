import { cn } from "@/lib/utils";

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] ?? "") + (parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "")).toUpperCase();
}

/** Photo when there is one, gold initials otherwise. */
export function Avatar({ name, src, className }: { name: string; src?: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={cn("h-10 w-10 shrink-0 rounded-full object-cover", className)} />;
  }
  return (
    <span
      aria-hidden="true"
      className={cn("inline-flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-full bg-gold-500 text-sm font-semibold text-navy-950", className)}
    >
      {initialsOf(name)}
    </span>
  );
}
