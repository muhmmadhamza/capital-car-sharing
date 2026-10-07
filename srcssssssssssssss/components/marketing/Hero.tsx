import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { CheckIcon } from "@/components/ui/Icons";
import { CarIllustration } from "@/components/cars/CarIllustration";

const assurances = [
  "Drivers and owners are verified online",
  "Daily price shown before you book",
  "Cars from private owners and fleet partners",
];

export function Hero() {
  return (
    <section className="bg-navy-900 pb-28 pt-12 text-white sm:pb-32 sm:pt-16 lg:pb-36 lg:pt-20">
      <Container className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-8">
        <div>
          <h1 className="text-[2.5rem] font-semibold leading-[1.04] tracking-tight sm:text-6xl lg:text-[4.25rem]">
            Every car verified.
            <br />
            Every driver too.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy-100">
            Capital Car Sharing connects drivers with cars from vetted owners and fleet partners. Search, verify your
            licence online, book and drive.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/cars" size="lg">
              Find Your Car
            </Button>
            <Button href="/#partners" size="lg" variant="outline-light">
              Become a Partner
            </Button>
          </div>

          <ul className="mt-10 space-y-3 text-sm text-navy-100">
            {assurances.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <CheckIcon className="shrink-0 text-gold-400" width={18} height={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pl-4">
          <CarIllustration type="sedan" mode="line" animate className="h-auto w-full" />
        </div>
      </Container>
    </section>
  );
}
