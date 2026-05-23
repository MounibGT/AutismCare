import {
  ComplementaryServicesSection,
  ModelWorksSection,
  SentiersProgramSection,
  ServicesHeroSection,
  ServiceProgramsSection,
} from "@/components/sections/services";
import ColorTransition from "@/components/ui/ColorTransition";

export default function ServicesPage() {
  return (
    <main>
      <ServicesHeroSection />
      <ColorTransition fromColor="accent" toColor="background" />
      <ServiceProgramsSection />
      <ColorTransition fromColor="background" toColor="muted" />
      <SentiersProgramSection />
      <ColorTransition fromColor="muted" toColor="background" />
      <ComplementaryServicesSection />
      <ColorTransition fromColor="background" toColor="muted" />
      <ModelWorksSection />
    </main>
  );
}
