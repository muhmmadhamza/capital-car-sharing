import type { Metadata } from "next";
import { CarCard } from "@/components/cars/CarCard";
import { FilterPanel } from "@/components/cars/FilterPanel";
import { SearchForm } from "@/components/cars/SearchForm";
import { SortSelect } from "@/components/cars/SortSelect";
import { Button } from "@/components/ui/Button";
import { ConnectionNotice, EmptyNotice } from "@/components/ui/ConnectionNotice";
import { AlertIcon } from "@/components/ui/Icons";
import { Container } from "@/components/ui/Container";
import { FILTER_KEYS, parseSearchParams, windowQueryString } from "@/features/cars/search-params";
import { formatDateTime } from "@/lib/date";
import { listLocations, searchCars } from "@/services/cars";
import { errorMessage } from "@/services/errors";

export const metadata: Metadata = {
  title: "Cars",
  description: "Search verified cars, compare daily prices and see what is available for your dates.",
};

// Availability depends on today's date and the query string, so never cache this page.
export const dynamic = "force-dynamic";

type RawParams = Record<string, string | string[] | undefined>;

export default async function CarsPage({ searchParams }: { searchParams: Promise<RawParams> }) {
  const raw = await searchParams;
  const { query, fields, windowError } = parseSearchParams(raw);
  // A failed search is shown as a connection problem, never as "no cars". Location suggestions are optional.
  const [carsResult, locationsResult] = await Promise.allSettled([searchCars(query), listLocations()]);
  const loadError = carsResult.status === "rejected" ? errorMessage(carsResult.reason) : undefined;
  const cars = carsResult.status === "fulfilled" ? carsResult.value : [];
  const locations = locationsResult.status === "fulfilled" ? locationsResult.value : [];

  // Normalise to string[] for the client components.
  const params: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(raw)) {
    const list = (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean);
    if (list.length) params[k] = list;
  }
  const carry = Object.fromEntries(Object.entries(params).filter(([k]) => (FILTER_KEYS as readonly string[]).includes(k)));

  const detailsQuery = query.window ? windowQueryString(fields) : "";
  const hasWindow = Boolean(query.window);
  const availableCount = cars.filter((c) => c.availability.status === "available").length;
  const isFiltered = Boolean(query.location || query.window || Object.keys(carry).length);

  return (
    <>
      <section className="bg-navy-900 pb-24 pt-10 text-white sm:pt-14 lg:pb-28">
        <Container>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Find your car</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-navy-100">
            Pick your dates to see what is free, or browse every car and check its calendar.
          </p>
        </Container>
      </section>

      <section aria-label="Search cars" className="relative z-10 -mt-14">
        <Container>
          <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-search sm:p-6">
            <SearchForm
              key={JSON.stringify([query.location, fields])}
              location={query.location}
              fields={fields}
              locationNames={locations.map((l) => l.name)}
              carry={carry}
            />
          </div>
        </Container>
      </section>

      <Container className="py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[17rem_1fr] xl:grid-cols-[18rem_1fr]">
          <FilterPanel params={params} query={query} resultCount={cars.length} />

          <div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {loadError ? (
                  <h2 className="text-xl font-semibold text-navy-900">Cars</h2>
                ) : (
                  <>
                    <h2 className="text-xl font-semibold text-navy-900">
                      {cars.length} {cars.length === 1 ? "car" : "cars"}
                      {query.location ? ` near “${query.location}”` : ""}
                    </h2>
                    <p className="mt-1 text-sm text-muted" aria-live="polite">
                      {query.window
                        ? `${formatDateTime(query.window.pickup)} to ${formatDateTime(query.window.return)} · ${availableCount} available`
                        : "Showing availability from today. Add dates to check a specific trip."}
                    </p>
                  </>
                )}
              </div>
              <SortSelect params={params} value={query.sort} />
            </div>

            {windowError ? (
              <p role="alert" className="mt-5 flex items-start gap-2 rounded-lg border border-gold-700/30 bg-gold-500/15 px-4 py-3 text-sm text-navy-900">
                <AlertIcon width={18} height={18} className="mt-px shrink-0 text-gold-700" />
                {windowError}
              </p>
            ) : null}

            {loadError ? (
              <ConnectionNotice className="mt-6" title="We couldn't load cars" message={loadError}>
                <Button href="/cars" variant="outline-navy">
                  Try again
                </Button>
              </ConnectionNotice>
            ) : cars.length > 0 ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2 2xl:grid-cols-3">
                {cars.map((car) => (
                  <CarCard
                    key={car.id}
                    car={car}
                    availability={car.availability}
                    hasWindow={hasWindow}
                    detailsQuery={detailsQuery}
                  />
                ))}
              </div>
            ) : isFiltered ? (
              <EmptyNotice
                className="mt-6"
                title="No cars match"
                text="Try removing a filter, widening the price range or searching a different location."
              >
                <Button href="/cars" variant="outline-navy">
                  Reset search
                </Button>
              </EmptyNotice>
            ) : (
              <EmptyNotice className="mt-6" title="No cars listed yet" text="Cars from our partners will appear here as soon as they are approved. Please check back soon." />
            )}
          </div>
        </div>
      </Container>
    </>
  );
}
