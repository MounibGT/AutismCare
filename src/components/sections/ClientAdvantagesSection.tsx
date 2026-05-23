"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Clock,
  Users,
  BookOpen,
  Shield,
  Video,
  CheckCircle,
} from "lucide-react";

export default function ClientAdvantagesSection() {
  const t = useTranslations("ClientAdvantagesSection");

  const advantages = [
    {
      icon: Clock,
      titleKey: "quickAccess.title",
      descriptionKey: "quickAccess.description",
    },
    {
      icon: Users,
      titleKey: "diverseProfessionals.title",
      descriptionKey: "diverseProfessionals.description",
    },
    {
      icon: BookOpen,
      titleKey: "educationalContent.title",
      descriptionKey: "educationalContent.description",
    },
    {
      icon: Shield,
      titleKey: "confidentiality.title",
      descriptionKey: "confidentiality.description",
    },
  ];

  const professionals = [
    {
      titleKey: "professionals.psychologist",
      image: "/professionals/psychologist.jpg",
    },
    {
      titleKey: "professionals.psychotherapist",
      image: "/professionals/psychotherapist.jpg",
    },
    {
      titleKey: "professionals.neuropsychologist",
      image: "/professionals/neuropsychologist.jpg",
    },
    {
      titleKey: "professionals.socialWorker",
      image: "/professionals/social-worker.jpg",
    },
    {
      titleKey: "professionals.psychoeducator",
      image: "/professionals/psychoeducator.jpg",
    },
    {
      titleKey: "professionals.mentalHealthCounselor",
      image: "/professionals/counselor.jpg",
    },
    {
      titleKey: "professionals.psychiatrist",
      image: "/professionals/psychiatrist.jpg",
    },
  ];

  return (
    <section className="relative py-24 bg-linear-to-b from-muted via-card to-background overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-40 right-20 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block text-sm font-bold text-primary uppercase tracking-widest mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            {t("title")}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Hero Image */}
        <div className="mb-16 mx-auto max-w-4xl">
          <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/PatientTestimonialHappy.jpg"
              alt="Happy patient using health platform"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto mb-24">
          {advantages.map((advantage, index) => (
            <div
              key={index}
              className="bg-card rounded-3xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-border animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6">
                <div className="p-4 bg-foreground rounded-2xl inline-block">
                  <advantage.icon
                    className="w-8 h-8 text-background"
                    strokeWidth={2}
                  />
                </div>
              </div>
              <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                {t(advantage.titleKey)}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t(advantage.descriptionKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Educational Content Highlight */}
        <div className="bg-linear-to-br from-accent/20 via-accent/10 to-transparent rounded-3xl p-8 md:p-12 mb-24 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="shrink-0">
              <div className="p-6 bg-foreground rounded-3xl">
                <Video
                  className="w-12 h-12 text-background"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                {t("educationalHighlight.title")}
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {t("educationalHighlight.description")}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {[
                  "anxiety",
                  "burnout",
                  "stress",
                  "depression",
                  "selfEsteem",
                ].map((topic) => (
                  <span
                    key={topic}
                    className="px-4 py-2 bg-card rounded-full text-sm font-medium text-foreground border border-border"
                  >
                    {t(`topics.${topic}`)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Professionals Section */}
        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
            {t("professionalsSection.title")}
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("professionalsSection.subtitle")}
          </p>
        </div>

        {/* Professionals Grid with Photos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 md:gap-6 max-w-6xl mx-auto">
          {professionals.map((professional, index) => (
            <div
              key={index}
              className="group relative animate-fade-in-up"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-muted shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                {/* Placeholder image - replace with actual professional photos */}
                <div className="absolute inset-0 bg-linear-to-br from-accent/30 via-primary/20 to-muted flex items-center justify-center">
                  <Users
                    className="w-12 h-12 text-foreground/30"
                    strokeWidth={1}
                  />
                </div>
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-foreground/90 to-transparent"></div>
                {/* Title */}
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                  <h4 className="text-xs md:text-sm font-semibold text-white text-center leading-tight">
                    {t(professional.titleKey)}
                  </h4>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-sm">{t("trustIndicators.licensed")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-sm">{t("trustIndicators.supervised")}</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="text-sm">{t("trustIndicators.confidential")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
