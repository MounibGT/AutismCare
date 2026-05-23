import ClientHeroSection from "@/components/sections/client/ClientHeroSection";
import QuickAccessSection from "@/components/sections/client/QuickAccessSection";
import ExploreTopicsSection from "@/components/sections/client/ExploreTopicsSection";
import ResourcesSection from "@/components/sections/client/ResourcesSection";
import ClientCTASection from "@/components/sections/client/ClientCTASection";
import ColorTransition from "@/components/ui/ColorTransition";

export default function BookPage() {
  return (
    <main>
      <ClientHeroSection />
      <ColorTransition fromColor="accent" toColor="background" />
      <QuickAccessSection />
      <ColorTransition fromColor="background" toColor="background" />
      <ExploreTopicsSection />
      <ColorTransition fromColor="background" toColor="muted" />
      <ResourcesSection />
      <ColorTransition fromColor="muted" toColor="accent" />
      <ClientCTASection />
    </main>
  );
}
