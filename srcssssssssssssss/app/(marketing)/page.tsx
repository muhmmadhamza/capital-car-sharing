import { CtaSection } from "@/components/marketing/CtaSection";
import { FeaturedCars } from "@/components/marketing/FeaturedCars";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PartnerSection } from "@/components/marketing/PartnerSection";
import { SearchCard } from "@/components/marketing/SearchCard";
import { WhyChoose } from "@/components/marketing/WhyChoose";

export default function HomePage() {
  return (
    <>
      <Hero />
      <SearchCard />
      <FeaturedCars />
      <HowItWorks />
      <WhyChoose />
      <PartnerSection />
      <CtaSection />
    </>
  );
}
