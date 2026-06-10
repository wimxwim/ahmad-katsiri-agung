import { HeroSection } from "@/components/beranda/HeroSection";
import { FeatureGrid } from "@/components/beranda/FeatureGrid";
import { DualCTACards } from "@/components/beranda/DualCTACards";
import { RuangDoa } from "@/components/beranda/RuangDoa";
import { AyatBlock } from "@/components/beranda/AyatBlock";

export default function Home() {
  return (
    <>
      <HeroSection />
      <FeatureGrid />
      <DualCTACards />
      <RuangDoa />
      <AyatBlock />
    </>
  );
}
