"use client";

import { GraduationCap, School, ClipboardList, Users2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function SentiersProgramSection() {
  const t = useTranslations("Services.sentiersProgram");

  const sentiersItems = [
    {
      title: t("pillars.assessment.title"),
      description: t("pillars.assessment.description"),
    },
    {
      title: t("pillars.iep.title"),
      description: t("pillars.iep.description"),
    },
    {
      title: t("pillars.collaboration.title"),
      description: t("pillars.collaboration.description"),
    },
    {
      title: t("pillars.support.title"),
      description: t("pillars.support.description"),
    },
  ];
  return (
    <section
      id="sentiers"
      className="relative overflow-hidden bg-linear-to-b from-muted via-muted to-muted py-24 scroll-mt-20"
    >
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute left-0 top-24 h-80 w-80 -translate-x-1/3 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-0 bottom-0 h-104 w-104 translate-x-1/4 translate-y-1/4 rounded-full bg-accent blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-6xl space-y-12">
          <header className="text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground/70">
              {t("badge")}
            </p>
            <h2 className="mt-4 font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
              {t("title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
          </header>

          <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6 rounded-4xl bg-card/80 p-10 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <School className="h-4 w-4" />
                <span>{t("pillarsTitle")}</span>
              </div>
              <ul className="space-y-5 text-sm leading-relaxed text-muted-foreground">
                {sentiersItems.map((item) => (
                  <li key={item.title} className="rounded-3xl bg-muted/30 p-5">
                    <p className="font-serif text-lg text-foreground">
                      {item.title}
                    </p>
                    <p className="mt-2">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-8">
              <div className="rounded-4xl border border-border/15 bg-card/85 p-8 shadow-lg">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  <ClipboardList className="h-4 w-4" />
                  <span>{t("professionalsTitle")}</span>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {t.raw("professionals").map((professional: string) => (
                    <li key={professional} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-primary" />
                      <span>{professional}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-4xl border border-dashed border-primary/35 bg-card/70 p-8 text-sm leading-relaxed text-muted-foreground">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-foreground text-card">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <p>{t("customSupport")}</p>
              </div>

              <div className="rounded-4xl border border-border/15 bg-card/85 p-6 shadow-lg">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  <Users2 className="h-4 w-4" />
                  <span>{t("networkTitle")}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {t("networkDescription")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
