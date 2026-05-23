"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function ProfessionalHeroSection() {
  const t = useTranslations("ProfessionalHero");

  return (
    <section className="relative h-screen flex items-center justify-center bg-accent overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5"></div>

      <div className="container mx-auto px-6 pt-20 pb-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Top Tagline */}
          <div className="mb-4 animate-fade-in">
            <p className="text-sm md:text-base tracking-[0.3em] uppercase text-muted-foreground font-light mb-2">
              {t("tagline")}
            </p>
            <div className="w-32 h-0.5 bg-muted-foreground mx-auto"></div>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-light text-foreground mb-8 leading-tight animate-fade-in-up">
            {t("headline")}
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-4xl mx-auto mb-8 leading-relaxed font-light animate-fade-in-up animation-delay-200">
            {t("description")}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
            <Link
              href="/signup/professional"
              className="group relative px-10 py-5 bg-primary text-primary-foreground rounded-full text-lg font-light tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <span className="relative z-10">{t("joinPlatform")}</span>
              <div className="absolute inset-0 bg-primary/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Link>

            <Link
              href="/professional/learn-more"
              className="group flex items-center gap-3 px-8 py-5 text-foreground text-lg font-light tracking-wide transition-all duration-300 hover:gap-4 border border-muted-foreground/20 rounded-full hover:bg-muted/50"
            >
              <span>{t("learnMore")}</span>
            </Link>
          </div>

          {/* Additional Info Tags */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-in animation-delay-600">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span>{t("activeProfessionals")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span>{t("satisfactionRate")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <span>{t("platformSupport")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
