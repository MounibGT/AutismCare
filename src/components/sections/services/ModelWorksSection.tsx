"use client";

import { CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ModelWorksSection() {
  const t = useTranslations("Services.modelWorks");
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-muted via-muted to-background py-24">
      <div className="absolute inset-0 opacity-[0.08]">
        <div className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-primary blur-3xl" />
        <div className="absolute right-10 bottom-0 h-72 w-72 translate-y-1/4 rounded-full bg-primary/60 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto max-w-4xl rounded-[3rem] bg-card/80 p-12 text-center shadow-xl backdrop-blur">
          <h2 className="font-serif text-3xl font-medium leading-tight text-foreground md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            {t("description")}
          </p>
          <div className="mt-10 grid gap-4 text-left text-sm leading-relaxed text-muted-foreground md:grid-cols-2">
            {t.raw("reasons").map((reason: string) => (
              <div
                key={reason}
                className="flex items-start gap-3 rounded-3xl bg-muted/40 p-4"
              >
                <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
