import ProfessionalHeroSection from "@/components/sections/professional/ProfessionalHeroSection";
import MatchingSystemSection from "@/components/sections/professional/MatchingSystemSection";
import PlatformBenefitsSection from "@/components/sections/professional/PlatformBenefitsSection";
import ProfessionalCTASection from "@/components/sections/professional/ProfessionalCTASection";
import ColorTransition from "@/components/ui/ColorTransition";

export default function ProfessionalPage() {
  return (
    <main>
      <ProfessionalHeroSection />
      <ColorTransition fromColor="accent" toColor="background" />
      <MatchingSystemSection />
      <ColorTransition fromColor="background" toColor="muted" />
      <PlatformBenefitsSection />
      <ColorTransition fromColor="muted" toColor="accent" />
      <ProfessionalCTASection />
    </main>
  );
}
