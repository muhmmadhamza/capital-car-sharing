import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CheckIcon } from "@/components/ui/Icons";
import { CarIllustration } from "@/components/cars/CarIllustration";
import { formatPrice } from "@/lib/utils";

const benefits = [
  "Set the days your car is available and the daily rate you want.",
  "Renters are verified online before they can book.",
  "Follow every booking from your partner dashboard.",
];

const listingSteps = [
  { label: "Vehicle details", done: true },
  { label: "Photos and documents", done: true },
  { label: "Availability calendar", done: false },
  { label: "Daily rate", done: false },
];

export function PartnerSection() {
  return (
    <section id="partners" className="scroll-mt-20 bg-navy-900 py-20 text-white lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
            Your car can earn while it&apos;s parked
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">
            List your vehicle on Capital Car Sharing as a private owner or a fleet partner. You choose when it&apos;s
            available. We handle verification and bookings.
          </p>

          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex gap-3">
                <CheckIcon className="mt-0.5 shrink-0 text-gold-400" width={20} height={20} />
                <span className="text-navy-50">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button size="lg">List Your Car</Button>
            <Button size="lg" variant="outline-light">
              Partner enquiries
            </Button>
          </div>
        </div>

        {/* Preview of the listing flow that arrives with the Partner dashboard. */}
        <div className="rounded-2xl border border-white/10 bg-navy-800 p-5 sm:p-6">
          <div className="rounded-xl bg-navy-950 px-5 pb-2 pt-5">
            <CarIllustration type="suv" paint="#7C8DA8" className="mx-auto h-auto w-full max-w-sm" />
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold">Your listing</p>
              <p className="text-sm text-navy-200">Example vehicle</p>
            </div>
            <p className="text-right">
              <span className="font-display text-xl font-semibold text-gold-400">{formatPrice(56)}</span>
              <span className="ml-1 text-sm text-navy-200">per day</span>
            </p>
          </div>

          <ul className="mt-5 divide-y divide-white/10 border-t border-white/10">
            {listingSteps.map((step) => (
              <li key={step.label} className="flex items-center justify-between py-3 text-sm">
                <span className={step.done ? "text-white" : "text-navy-200"}>{step.label}</span>
                {step.done ? (
                  <span className="inline-flex items-center gap-1.5 text-gold-400">
                    <CheckIcon width={16} height={16} />
                    Done
                  </span>
                ) : (
                  <span className="text-navy-300">To do</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
