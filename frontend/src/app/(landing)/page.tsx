import { CtaSection } from "@/components/landing/CtaSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { Footer } from "@/components/landing/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingBackground } from "@/components/landing/LandingBackground";
import { Navbar } from "@/components/landing/Navbar";
import { RolesSection } from "@/components/landing/RolesSection";
import { SocialProofBar } from "@/components/landing/SocialProofBar";

export default function LandingPage() {
  return (
    <>
      <LandingBackground />
      <Navbar />
      <main className="relative z-10">
        <HeroSection />
        <SocialProofBar />
        <FeaturesGrid />
        <HowItWorks />
        <RolesSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
