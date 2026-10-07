import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityBadge } from "@/components/cars/AvailabilityBadge";
import { AvailabilityCalendar } from "@/components/cars/AvailabilityCalendar";
import { BookingProvider } from "@/components/cars/BookingProvider";
import { CarGallery } from "@/components/cars/CarGallery";
import { ReservePanel } from "@/components/cars/ReservePanel";
import { Container } from "@/components/ui/Container";
import { BagIcon, CheckIcon, FuelIcon, GearIcon, PinIcon, SeatIcon } from "@/components/ui/Icons";
import { parseSearchParams } from "@/features/cars/search-params";
import { formatPrice } from "@/lib/utils";
import { getCarDetail } from "@/services/cars";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarDetail(slug);
  if (!car) return { title: "Car not found" };
  return {
    title: `${car.make} ${car.model} ${car.year}`,
    description: `Rent the ${car.year} ${car.make} ${car.model} from ${car.location.name}. See the calendar and reserve.`,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-navy-900/10 pt-8">
      <h2 className="text-2xl font-semibold tracking-tight text-navy-900">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function CarDetailPage({ params, searchParams }: Props) {
  const [{ slug }, raw] = await Promise.all([params, searchParams]);
  const { query, fields } = parseSearchParams(raw);
  const car = await getCarDetail(slug, query.window);
  if (!car) notFound();

  const specs: [string, string][] = [
    ["Category", car.category],
    ["Year", String(car.year)],
    ["Seats", `${car.seats} seats`],
    ["Doors", String(car.doors)],
    ["Transmission", car.transmission],
    ["Fuel type", car.fuel],
    ["Luggage", `${car.luggage} large ${car.luggage === 1 ? "bag" : "bags"}`],
    ["Pickup point", car.location.name],
  ];

  return (
    <BookingProvider
      blocks={car.blocks}
      now={car.now}
      initial={{
        startDate: query.window ? fields.pickupDate : undefined,
        endDate: query.window ? fields.returnDate : undefined,
        pickupTime: fields.pickupTime,
        returnTime: fields.returnTime,
      }}
    >
      <section className="bg-navy-900 pb-10 pt-8 text-white">
        <Container>
          <nav aria-label="Breadcrumb" className="text-sm text-navy-100">
            <Link href="/cars" className="hover:text-white">
              Cars
            </Link>
            <span aria-hidden="true" className="mx-2 text-navy-200">
              /
            </span>
            <span aria-current="page" className="text-white">
              {car.make} {car.model}
            </span>
          </nav>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-navy-100">
                {car.category}, {car.year}
              </p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-5xl">
                {car.make} {car.model}
              </h1>
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-navy-100">
                <PinIcon width={16} height={16} className="text-gold-400" />
                {car.location.name}, {car.location.city}
              </p>
            </div>
            <AvailabilityBadge availability={car.availability} hasWindow={Boolean(query.window)} className="self-start sm:self-auto" />
          </div>
        </Container>
      </section>

      <Container className="py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_24rem]">
          <div className="min-w-0 space-y-10">
            <CarGallery car={car} />

            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-navy-700">
              <li className="inline-flex items-center gap-2"><SeatIcon className="text-gold-700" /> {car.seats} seats</li>
              <li className="inline-flex items-center gap-2"><GearIcon className="text-gold-700" /> {car.transmission}</li>
              <li className="inline-flex items-center gap-2"><FuelIcon className="text-gold-700" /> {car.fuel}</li>
              <li className="inline-flex items-center gap-2"><BagIcon className="text-gold-700" /> {car.luggage} bags</li>
            </ul>

            <p className="max-w-prose text-lg leading-relaxed text-navy-700">{car.description}</p>

            <Section title="Specifications">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                {specs.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-navy-900/10 py-3 text-sm">
                    <dt className="text-muted">{label}</dt>
                    <dd className="text-right font-medium text-navy-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section title="Features">
              <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {car.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-navy-700">
                    <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-gold-700" />
                    {feature}
                  </li>
                ))}
              </ul>
            </Section>

            <Section title="Pricing">
              <dl className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-navy-900/10 p-4">
                  <dt className="text-sm text-muted">Daily rate</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-navy-900">{formatPrice(car.pricePerDay)}</dd>
                </div>
                <div className="rounded-xl border border-navy-900/10 p-4">
                  <dt className="text-sm text-muted">Refundable deposit</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-navy-900">{formatPrice(car.depositAmount)}</dd>
                </div>
                <div className="rounded-xl border border-navy-900/10 p-4">
                  <dt className="text-sm text-muted">Included mileage</dt>
                  <dd className="mt-1 font-display text-2xl font-semibold text-navy-900">{car.mileagePerDay} km/day</dd>
                </div>
              </dl>
              <p className="mt-4 text-sm text-muted">
                Each started 24 hours counts as one day. Taxes and any extras are confirmed at checkout.
              </p>
            </Section>

            <Section title="Availability">
              <div className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-card sm:p-6">
                <AvailabilityCalendar />
              </div>
            </Section>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <ReservePanel car={car} availability={car.availability} hasWindow={Boolean(query.window)} />
          </div>
        </div>
      </Container>
    </BookingProvider>
  );
}
