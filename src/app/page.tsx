import { HeroSection } from "@/components/beranda/HeroSection";
import { FeatureGrid } from "@/components/beranda/FeatureGrid";
import { DualCTACards } from "@/components/beranda/DualCTACards";
import { AyatBlock } from "@/components/beranda/AyatBlock";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <DualCTACards />
      <AyatBlock />
    </>
  );
}
