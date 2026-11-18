import { CtaSection } from "@/components/marketing/CtaSection";
import { FeaturedCars } from "@/components/marketing/FeaturedCars";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { PartnerSection } from "@/components/marketing/PartnerSection";
import { SearchCard } from "@/components/marketing/SearchCard";
import { WhyChoose } from "@/components/marketing/WhyChoose";

// Featured cars come from the API, so this page is rendered per request, never baked at build time.
export const dynamic = "force-dynamic";

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
