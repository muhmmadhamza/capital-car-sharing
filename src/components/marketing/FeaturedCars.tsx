import { featuredCars } from "@/data/featured-cars";
import { CarCard } from "@/components/cars/CarCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function FeaturedCars() {
  return (
    <section id="cars" className="scroll-mt-20 py-20 lg:py-28">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading title="Featured cars">
            A selection of vehicles from our partners, from city hatchbacks to premium coupes.
          </SectionHeading>
          <Button variant="outline-navy" className="self-start sm:self-auto">
            Browse all cars
          </Button>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {featuredCars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      </Container>
    </section>
  );
}
