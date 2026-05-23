"use client";

import {
  HeartPulse,
  Baby,
  Users,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  TrendingUp,
  HeartHandshake,
  Leaf,
  Brain,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

type ServiceProgram = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
  borderClass: string;
};

const servicePrograms: ServiceProgram[] = [
  {
    id: "adult",
    icon: HeartPulse,
    colorClass: "text-rose-700",
    bgClass: "bg-rose-50",
    borderClass: "border-rose-200",
  },
  {
    id: "child",
    icon: Baby,
    colorClass: "text-sky-700",
    bgClass: "bg-sky-50",
    borderClass: "border-sky-200",
  },
  {
    id: "family",
    icon: Users,
    colorClass: "text-violet-700",
    bgClass: "bg-violet-50",
    borderClass: "border-violet-200",
  },
  {
    id: "workplace",
    icon: Briefcase,
    colorClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
  },
  {
    id: "schoolAnxiety",
    icon: GraduationCap,
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
  },
];

const featureIcons = [
  Clock,
  Shield,
  Zap,
  TrendingUp,
  HeartHandshake,
  Leaf,
  Brain,
  Sparkles,
  CheckCircle2,
];

export default function ServiceProgramsSection() {
  const t = useTranslations("Services.programs");

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-background via-background to-background py-24">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-0 top-24 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/4 translate-y-1/4 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-5xl text-center mb-16">
          <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
            {t("badge")}
          </p>
          <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Image placeholder */}
        <div className="mb-16 mx-auto max-w-4xl">
          <div className="relative aspect-21/9 rounded-3xl overflow-hidden shadow-xl">
            <Image
              src="/TherapySessionProfessional.jpg"
              alt={t("imageAlt")}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="space-y-12 max-w-6xl mx-auto">
          {servicePrograms.map((program, programIndex) => {
            const Icon = program.icon;
            const features = t.raw(`${program.id}.features`) as string[];

            return (
              <article
                key={program.id}
                className={`rounded-4xl border ${program.borderClass} ${program.bgClass}/30 p-8 md:p-12 backdrop-blur transition-all duration-300 hover:shadow-xl`}
              >
                <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
                  <div className="space-y-6">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-card">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                      {t(`${program.id}.title`)}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {t(`${program.id}.description`)}
                    </p>
                    <div className="pt-4">
                      <div className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-foreground">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{t(`${program.id}.highlight`)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {features.map((feature: string, index: number) => {
                      const FeatureIcon =
                        featureIcons[
                          (programIndex * 2 + index) % featureIcons.length
                        ];
                      return (
                        <div
                          key={index}
                          className="flex items-start gap-3 rounded-3xl bg-card/80 p-5 shadow-sm"
                        >
                          <div
                            className={`mt-0.5 h-8 w-8 shrink-0 rounded-xl ${program.bgClass} flex items-center justify-center`}
                          >
                            <FeatureIcon
                              className={`h-4 w-4 ${program.colorClass}`}
                            />
                          </div>
                          <span className="text-sm leading-relaxed text-muted-foreground">
                            {feature}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
