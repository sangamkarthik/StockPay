import { CommunitySection } from "./sections/community-section";
import { FinalCtaSection } from "./sections/final-cta-section";
import { HeroSection } from "./sections/hero-section";
import { HowItWorks } from "./sections/how-it-works";
import { InfoBar } from "./sections/info-bar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FEF9F5] text-primary">
      <HeroSection />
      <InfoBar />
      <HowItWorks />
      <CommunitySection />
      <FinalCtaSection />
    </div>
  );
}
