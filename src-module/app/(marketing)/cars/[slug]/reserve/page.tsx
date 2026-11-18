import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutPanel } from "@/components/cars/CheckoutPanel";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AlertIcon } from "@/components/ui/Icons";
import { parseSearchParams } from "@/features/cars/search-params";
import { combine } from "@/lib/date";
import { checkRental, getCarDetail } from "@/services/cars";

export const metadata: Metadata = { title: "Reserve", robots: { index: false } };
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Checkout / review step. The page itself re-checks the dates on the server (so a link edited by hand or a car
 * booked a minute ago cannot slip through) and then hands over to CheckoutPanel, which shows the server's price
 * and lets a verified, signed-in customer confirm. Anonymous visitors are asked to log in and return here.
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
  const returnTo = `/cars/${car.slug}/reserve${backQuery ? `?${backQuery}` : ""}`;

  return (
    <>
      <section className="bg-navy-900 py-10 text-white sm:py-14">
        <Container>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Review and confirm</h1>
        </Container>
      </section>

      <Container className="py-10 lg:py-14">
        <div className="mx-auto max-w-2xl rounded-2xl border border-navy-900/10 bg-white p-6 shadow-card sm:p-8">
          {result.ok && pickup && ret && fields.pickupDate && fields.returnDate ? (
            <CheckoutPanel
              car={{
                id: car.id,
                name: `${car.make} ${car.model}`,
                subtitle: `${car.category}, ${car.year}`,
                locationName: car.location.name,
                pricePerDay: car.pricePerDay,
              }}
              pickupDate={fields.pickupDate}
              pickupTime={fields.pickupTime}
              returnDate={fields.returnDate}
              returnTime={fields.returnTime}
              returnTo={returnTo}
            />
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
