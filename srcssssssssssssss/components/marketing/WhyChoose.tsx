import { Container } from "@/components/ui/Container";

const reasons = [
  {
    title: "Verified on both sides",
    text: "Drivers and owners complete online verification before they take part, so you know who you're dealing with.",
  },
  {
    title: "Clear pricing",
    text: "See the daily rate and the trip total before you book. What you see is what you agree to pay.",
  },
  {
    title: "A car for every trip",
    text: "Economy hatchbacks, family SUVs and premium sedans, listed by owners and fleet partners.",
  },
  {
    title: "Availability you can rely on",
    text: "Owners keep their calendars current, so a car you can see is a car you can book.",
  },
  {
    title: "Pickup that suits you",
    text: "Choose from the pickup points owners offer and agree a time that works for both of you.",
  },
  {
    title: "People to call",
    text: "Reach our team by phone or email about a booking, a listing or a problem on the road.",
  },
];

export function WhyChoose() {
  return (
    <section id="about" className="scroll-mt-20 py-20 lg:py-28">
      <Container className="grid gap-12 lg:grid-cols-[1fr_1.7fr] lg:gap-20">
        <div>
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-navy-900 sm:text-4xl lg:sticky lg:top-28">
            Why choose Capital Car Sharing
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            We built the platform around trust, so renting or lending a car feels straightforward.
          </p>
        </div>

        <dl className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
          {reasons.map((reason) => (
            <div key={reason.title} className="border-t-2 border-gold-500 pt-4">
              <dt className="text-lg font-semibold text-navy-900">{reason.title}</dt>
              <dd className="mt-2 leading-relaxed text-muted">{reason.text}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
