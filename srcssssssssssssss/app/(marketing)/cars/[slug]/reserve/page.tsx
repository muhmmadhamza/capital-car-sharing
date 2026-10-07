import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AlertIcon, CheckIcon } from "@/components/ui/Icons";
import { parseSearchParams } from "@/features/cars/search-params";
import { combine, formatDateTime } from "@/lib/date";
import { formatPrice } from "@/lib/utils";
import { checkRental, getCarDetail } from "@/services/cars";

export const metadata: Metadata = { title: "Reserve", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Placeholder for the booking step. It does one real job: it re-checks the
 * dates on the server, so a link edited by hand or a car booked a minute ago
 * cannot slip through. Checkout, driver verification and payment come later.
 */
export default async function ReservePage({ params, searchParams }: Props) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const car = await getCarDetail(slug);
  if (!car) notFound();

  const { fields } = parseSearchParams(raw);
  const pickup = fields.pickupDate ? combine(fields.pickupDate, fields.pickupTime) : undefined;
  const ret = fields.returnDate ? combine(fields.returnDate, fields.returnTime) : undefined;
  const result = await checkRental(car.id, pickup, ret);

  const backQuery = new URLSearchParams(
    fields.pickupDate && fields.returnDate ? (fields as unknown as Record<string, string>) : {},
  ).toString();
  const backHref = `/cars/${car.slug}${backQuery ? `?${backQuery}` : ""}`;

  return (
    <>
      <section className="bg-navy-900 py-10 text-white sm:py-14">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Reserve your car</h1>
        </Container>
      </section>

      <Container className="py-10 lg:py-14">
        <div className="mx-auto max-w-2xl rounded-2xl border border-navy-900/10 bg-white p-6 shadow-card sm:p-8">
          <p className="text-sm text-muted">
            {car.category}, {car.year}
          </p>
          <h2 className="text-2xl font-semibold text-navy-900">
            {car.make} {car.model}
          </h2>
          <p className="mt-1 text-sm text-muted">Pickup and return at {car.location.name}</p>

          {result.ok && pickup && ret ? (
            <>
              <p className="mt-6 flex items-center gap-2 font-semibold text-[#14543A]">
                <CheckIcon width={18} height={18} /> These dates are still available.
              </p>
              <dl className="mt-4 divide-y divide-navy-900/10 border-y border-navy-900/10 text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-navy-700">Pickup</dt>
                  <dd className="font-medium text-navy-900">{formatDateTime(pickup)}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-navy-700">Return</dt>
                  <dd className="font-medium text-navy-900">{formatDateTime(ret)}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-navy-700">
                    {formatPrice(car.pricePerDay)} × {result.days} {result.days === 1 ? "day" : "days"}
                  </dt>
                  <dd className="font-display text-lg font-semibold text-navy-900">{formatPrice(result.days * car.pricePerDay)}</dd>
                </div>
              </dl>
              <p className="mt-5 rounded-lg bg-gold-500/15 px-4 py-3 text-sm text-navy-900">
                Driver verification, checkout and payment are the next module, so nothing is booked or charged yet.
              </p>
            </>
          ) : (
            <p role="alert" className="mt-6 flex items-start gap-2 rounded-lg border border-[#B3261E]/25 bg-[#FBEAE9] px-4 py-3 text-sm text-[#8E1D17]">
              <AlertIcon width={18} height={18} className="mt-0.5 shrink-0" />
              {result.ok ? "Those dates are not valid." : result.message}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href={backHref} variant="outline-navy">
              {result.ok ? "Change dates" : "Choose other dates"}
            </Button>
            <Link href="/cars" className="inline-flex h-11 items-center justify-center px-2 text-sm font-medium text-navy-700 underline underline-offset-2 hover:text-navy-900">
              Back to all cars
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}
