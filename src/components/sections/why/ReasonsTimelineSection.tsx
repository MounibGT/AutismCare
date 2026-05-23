"use client";

import { Compass, Award, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ReasonsTimelineSection() {
  const t = useTranslations("Why.reasons");

  const reasons = [
    {
      id: t("timeline.personalized.id"),
      title: t("timeline.personalized.title"),
      description: t("timeline.personalized.description"),
      chips: t.raw("timeline.personalized.chips"),
      icon: Compass,
    },
    {
      id: t("timeline.qualified.id"),
      title: t("timeline.qualified.title"),
      description: t("timeline.qualified.description"),
      chips: t.raw("timeline.qualified.chips"),
      icon: Award,
    },
    {
      id: t("timeline.ethics.id"),
      title: t("timeline.ethics.title"),
      description: t("timeline.ethics.description"),
      chips: t.raw("timeline.ethics.chips"),
      icon: ShieldCheck,
    },
  ];
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-background to-background py-24">
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-10 top-0 h-72 w-72 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/3 translate-y-1/4 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div className="sticky top-32 flex flex-col gap-6 self-start">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </div>

          <div className="space-y-10">
            {reasons.map(({ id, title, description, chips, icon: Icon }) => (
              <article
                key={id}
                className="group relative overflow-hidden rounded-4xl border border-border/20 bg-card/90 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-linear-to-br from-accent/10 via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                <div className="relative z-10 flex items-start gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <span className="font-serif text-2xl font-medium text-muted-foreground">
                      {id}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-card shadow-md">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="hidden h-full w-px bg-border/50 lg:block" />
                  </div>

                  <div className="space-y-5">
                    <h3 className="font-serif text-2xl font-medium text-foreground">
                      {title}
                    </h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {chips.map((chip: string) => (
                        <span
                          key={chip}
                          className="rounded-full border border-border/40 bg-muted/40 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors duration-200 group-hover:border-primary/40 group-hover:text-foreground"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
