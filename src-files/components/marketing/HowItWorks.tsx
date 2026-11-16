import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const steps = [
  {
    title: "Search",
    text: "Enter a pickup location and your dates to see the cars available for that trip.",
  },
  {
    title: "Verify",
    text: "Upload your licence and ID once. We check them online before your first booking.",
  },
  {
    title: "Book",
    text: "Choose a car, review the daily rate and the trip total, then confirm.",
  },
  {
    title: "Drive",
    text: "Collect the keys at the agreed pickup point and return the car on the date you chose.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-surface py-20 lg:py-28">
      <Container>
        <SectionHeading title="How it works">
          Four steps from search to the driver's seat.
        </SectionHeading>

        <ol className="relative mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* connecting line, large screens only */}
          <span
            aria-hidden="true"
            className="absolute left-6 right-[calc(25%-1.5rem)] top-6 hidden h-px bg-gold-500/60 lg:block"
          />
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 font-display text-lg font-semibold text-gold-400 ring-8 ring-surface">
                {index + 1}
              </span>
              <h3 className="mt-5 text-xl font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-2 max-w-xs leading-relaxed text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
