import { Button } from "@/components/ui/Button";
import { PageHeader, panel } from "./ui";

/** Placeholder for admin sections that arrive in a later part. The route and its protection already exist. */
export function ComingSoon({ title, description, planned }: { title: string; description: string; planned: string[] }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <section className={`${panel} p-6 sm:p-8`}>
        <span className="inline-flex rounded-full border border-gold-700/30 bg-gold-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-navy-900">Coming in the next part</span>
        <h2 className="mt-4 text-xl font-semibold text-navy-900">{title} management is on its way</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">This section is not built yet. Here is what it will cover:</p>
        <ul className="mt-4 space-y-2 text-sm text-navy-900">
          {planned.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button href="/admin" variant="navy">
            Back to dashboard
          </Button>
        </div>
      </section>
    </>
  );
}
