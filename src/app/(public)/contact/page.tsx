import {
  ContactChannelsSection,
  ContactFormSection,
  ContactHeroSection,
  EmergencySection,
  JoinUsSection,
  SupportSection,
} from "@/components/sections/contact";

export default function ContactPage() {
  return (
    <main className="bg-background">
      <ContactHeroSection />
      <ContactChannelsSection />
      <ContactFormSection />
      <SupportSection />
      <EmergencySection />
      <JoinUsSection />
    </main>
  );
}
