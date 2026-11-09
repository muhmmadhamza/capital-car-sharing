import { SearchForm } from "@/components/cars/SearchForm";
import { listLocations } from "@/services/cars";

/** Landing-page search. Submits to /cars, where results and availability are shown. */
export async function SearchCard() {
  // Location suggestions are a convenience: if they cannot be loaded the search still works as free text.
  const locations = await listLocations().catch(() => []);

  return (
    <section id="search" aria-label="Search cars" className="relative z-10 -mt-14 scroll-mt-24 sm:-mt-16">
      <div className="mx-auto w-full max-w-page px-5 sm:px-8">
        <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-search sm:p-6">
          <SearchForm locationNames={locations.map((l) => l.name)} />
        </div>
      </div>
    </section>
  );
}
