"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";
import { Award } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("HeroSection");
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const [activeHint, setActiveHint] = useState<string>("self");

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-accent overflow-hidden">
      {/* Background Pattern/Decoration */}
      <div className="absolute inset-0 opacity-5"></div>

      {/* Scale wrapper - scaled to ~110% */}
      <div className="container mx-auto px-5 sm:px-7 pt-20 pb-8 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-10">
          {/* Left Side: Content */}
          <div className="flex-1 w-full lg:max-w-[55%]">
            {/* Top Tagline */}
            <div className="mb-4 animate-fade-in">
              <p className="text-sm md:text-base tracking-[0.25em] uppercase text-muted-foreground font-light mb-2">
                {t("tagline")}
              </p>
              <div className="w-24 lg:w-28 h-0.5 bg-muted-foreground mx-auto lg:mx-0"></div>
            </div>

            {/* Designed by Psychologists Badge */}
            <div className="mb-5 animate-fade-in animation-delay-100">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
                <div className="flex items-center justify-center h-7 w-7 rounded-full bg-primary">
                  <Award className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {t("designedByPsychologists")}
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-[1.75rem] sm:text-3xl md:text-4xl lg:text-[2.75rem] xl:text-5xl font-serif font-light text-foreground mb-5 lg:mb-6 leading-tight animate-fade-in-up text-left">
              {t("headline")}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg lg:text-lg text-muted-foreground max-w-none lg:max-w-[95%] mb-6 leading-relaxed font-light animate-fade-in-up animation-delay-200 text-left">
              {t("description")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 animate-fade-in-up animation-delay-400 min-h-[100px]">
              {!showBookingOptions ? (
                // Main Buttons
                <div className="flex flex-col sm:flex-row items-start justify-start gap-3">
                  <button
                    onClick={() => setShowBookingOptions(true)}
                    className="group relative px-7 py-3.5 bg-primary text-primary-foreground rounded-full text-base font-light tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  >
                    <span className="relative z-10">{t("bookNow")}</span>
                    <div className="absolute inset-0 bg-primary/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </button>

                  <Link
                    href="/book"
                    className="group flex items-center gap-2 px-7 py-3.5 text-foreground text-base font-light tracking-wide transition-all duration-300 hover:gap-3 border border-muted-foreground/20 rounded-full hover:bg-muted/50"
                  >
                    <span>{t("learnMore")}</span>
                  </Link>
                </div>
              ) : (
                // Booking Options
                <div className="flex flex-col gap-3 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-start justify-start gap-2.5">
                    <Link
                      href="/appointment?for=self"
                      className="group relative px-5 py-2.5 bg-primary/90 text-primary-foreground rounded-full text-sm font-light tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      onMouseEnter={() => setActiveHint("self")}
                    >
                      <span className="relative z-10">{t("forSelf")}</span>
                      <div className="absolute inset-0 bg-primary/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>

                    <Link
                      href="/appointment?for=patient"
                      className="group relative px-5 py-2.5 bg-primary/90 text-primary-foreground rounded-full text-sm font-light tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      onMouseEnter={() => setActiveHint("patient")}
                    >
                      <span className="relative z-10">{t("forPatient")}</span>
                      <div className="absolute inset-0 bg-primary/80 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>

                    <Link
                      href="/appointment?for=loved-one"
                      className="group relative px-5 py-2.5 bg-primary/90 text-primary-foreground rounded-full text-sm font-light tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl"
                      onMouseEnter={() => setActiveHint("loved-one")}
                    >
                      <span className="relative z-10">{t("forLovedOne")}</span>
                      <div className="absolute inset-0 bg-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                    </Link>
                  </div>

                  {/* Hover Context Text with Back button */}
                  <div className="flex items-center justify-between gap-4 min-h-8">
                    <p className="text-sm text-muted-foreground italic transition-opacity duration-300 flex-1">
                      {activeHint === "self" && t("bookForSelfHint")}
                      {activeHint === "patient" && t("bookForPatientHint")}
                      {activeHint === "loved-one" && t("bookForLovedOneHint")}
                    </p>
                    <button
                      onClick={() => setShowBookingOptions(false)}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors underline whitespace-nowrap"
                    >
                      {t("back")}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info Tags */}
            <div className="flex flex-wrap items-center justify-start gap-4 text-sm text-muted-foreground animate-fade-in animation-delay-600 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                <span>{t("personalizedCare")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                <span>{t("flexibleScheduling")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary/60"></div>
                <span>{t("confidentialSupport")}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="flex-1 w-full lg:w-auto lg:max-w-[50%]">
            <div className="relative w-full h-[55vh] sm:h-[60vh] md:h-[65vh] lg:h-[75vh] max-h-[680px] flex items-center justify-center">
              <Image
                src="/New Project (3).png"
                alt="Mental Health Professional"
                width={720}
                height={720}
                className="w-auto h-full max-w-full object-contain animate-fade-in-up animation-delay-600"
                priority
              />
              {/* Fading effect at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-32 lg:h-36 bg-linear-to-t from-accent to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
