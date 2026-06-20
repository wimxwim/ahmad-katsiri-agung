import { HeroSection } from "@/components/beranda/HeroSection";
import { DeepLearningSection } from "@/components/beranda/DeepLearningSection";
import { FeatureGrid } from "@/components/beranda/FeatureGrid";
import { DualCTACards } from "@/components/beranda/DualCTACards";
import { RuangDoa } from "@/components/beranda/RuangDoa";
import { AyatBlock } from "@/components/beranda/AyatBlock";

export default function Home() {
  return (
    <>
      <HeroSection />
      <DeepLearningSection />
      <FeatureGrid />
      <DualCTACards />
      <RuangDoa />
      <AyatBlock />
    </>
  );
}
