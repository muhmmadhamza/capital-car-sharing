import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CtaSection() {
  return (
    <section className="bg-gold-500 py-16 lg:py-20">
      <Container className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight text-navy-950 sm:text-4xl">
            Find a car for your next trip
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-navy-900">
            Pick your dates, choose a verified car and book in a few minutes.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button href="/#search" variant="navy" size="lg">
            Search Cars
          </Button>
          <Button href="/#partners" variant="outline-navy" size="lg">
            Become a Partner
          </Button>
        </div>
      </Container>
    </section>
  );
}
