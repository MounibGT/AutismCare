"use client";

import { Route, Award, Clock, Lock, Zap, BookOpen, Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function ValueSection() {
  const t = useTranslations("ValueSection");
  const locale = useLocale();

  const clientBenefits = [
    {
      icon: Zap,
      titleKey: "benefits.fastAccess.title",
      descriptionKey: "benefits.fastAccess.description",
    },
    {
      icon: Users,
      titleKey: "benefits.varietyProfessionals.title",
      descriptionKey: "benefits.varietyProfessionals.description",
    },
    {
      icon: BookOpen,
      titleKey: "benefits.educationalResources.title",
      descriptionKey: "benefits.educationalResources.description",
    },
  ];

  const values = [
    {
      icon: Route,
      titleEn: "Personalized pathway",
      titleFr: "Un parcours personnalisé",
      descriptionEn:
        "Our approach is designed to offer a fully personalized experience.Every child demonstrates unique behaviors and needs, requiring tailored analysis based on artificial intelligence and behavioral data.",
      descriptionFr:
        "Notre approche est conçue pour proposer un parcours entièrement personnalisé, car chaque enfant présente des comportements et des besoins uniques, nécessitant une analyse adaptée basée sur l’intelligence artificielle et les données comportementales.",
      featuresEn: [],
      featuresFr: [],
    },
    {
      icon: Award,
      titleEn: "Recognized expertise",
      titleFr: "Une expertise reconnue",
      descriptionEn:
        "Our work is guided by recognized experts, including AI researchers, behavioral analysis specialists, and early detection system professionals.You benefit from scientifically supervised solutions in the fields of autism research and medical AI.",
      descriptionFr:
        "Que ce soit des chercheurs en intelligence artificielle, des spécialistes en analyse comportementale ou des experts en systèmes de détection précoce, vous bénéficiez toujours d’un travail encadré par des compétences scientifiques reconnues dans le domaine de l’autisme et de l’IA médicale.",
      featuresEn: [],
      featuresFr: [],
    },
    {
      icon: Clock,
      titleEn: "Accessibility and flexibility",
      titleFr: "Accessibilité et flexibilité",
      subtitleEn: "Wherever and Whenever You Need",
      subtitleFr: "Où et quand vous le souhaitez",
      descriptionEn:
        "We provide flexible solutions adapted to the needs of children and families.Assessments can be conducted remotely through secure AI-based platforms accessible from anywhere, or in-person within specialized environments.Our approach adapts analytical tools to each child’s specific needs, ensuring effective and personalized follow-up.",
      descriptionFr:
        "Nous offrons une solution flexible adaptée aux besoins des enfants et des familles : analyses et évaluations à distance via des plateformes sécurisées basées sur l’intelligence artificielle, accessibles partout, ou accompagnement en présentiel dans des environnements spécialisés. Notre approche permet d’adapter les outils d’analyse aux besoins spécifiques de chaque enfant, favorisant un suivi efficace et personnalisé.",
      featuresEn: [],
      featuresFr: [],
    },
    {
      icon: Lock,
      titleEn: "Confidentiality and ethics",
      titleFr: "Confidentialité et éthique",
      subtitleEn:
        "Ethics and confidentiality: The foundation of our commitment",
      subtitleFr:
        "Éthique et confidentialité : La fondation de notre engagement",
      descriptionEn:
        "Your well-being and your trust are our absolute priorities. Your data is hosted exclusively on Canadian servers, ensuring full data sovereignty. We follow strict compliance with Bill 25 and apply rigorous protection of your privacy. These principles are the foundations of our service, ensuring that you evolve in a safe and respectful environment.",
      descriptionFr:
        "La protection des données et le respect de l’éthique sont au cœur de notre démarche. Les informations collectées sont traitées de manière sécurisée et utilisées uniquement à des fins de recherche et d’analyse, dans le respect strict des normes de confidentialité et de protection de la vie privée. Ces principes garantissent un environnement fiable, responsable et respectueux pour les enfants et leurs familles.",
      featuresEn: [],
      featuresFr: [],
    },
  ];
  return (
    <section className="relative py-24 bg-linear-to-b from-background via-muted to-accent overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-[#8b7355] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#d4a574] rounded-full blur-3xl"></div>
      </div>
      <div
        className="absolute top-0 left-1/3 w-[1200px] h-[1200px] rounded-full animate-fade-in"
        style={{
          background:
            "radial-gradient(circle, oklch(0.92 0.015 75) 0%, oklch(0.92 0.015 75 / 0) 70%)",
        }}
      ></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-4">
            {t("title")}
          </h2>
          <p className="text-xl md:text-2xl text-foreground font-semibold mb-6">
            {t("subtitle")}
          </p>
          <p className="text-base md:text-lg text-muted-foreground font-normal leading-relaxed">
            {t("description", {
              integratedPlatform: t("integratedPlatform"),
            })}
          </p>
        </div>

        {/* Client Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
          {clientBenefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={index}
                className="bg-card/80 backdrop-blur-sm rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex p-3 bg-foreground rounded-xl mb-4">
                  <Icon className="w-6 h-6 text-card" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t(benefit.titleKey)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(benefit.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>

        {/* Staggered Grid Layout - 4 Column Stairs Pattern */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 max-w-[1600px] mx-auto">
          {/* First Column - Starts at top */}
          <div className="lg:mt-0">
            <ValueCard value={values[0]} index={0} locale={locale} />
            <div className="-mt-1 relative ">
              <Image
                src="/ValueSection.png"
                alt="Inner Child Healing"
                width={500}
                height={500}
                className="w-full h-auto transform scale-x-[-1] scale-110"
              />
              {/* Fading effect at bottom */}
              <div className="absolute -bottom-8 left-0 right-0 h-40 bg-linear-to-t from-accent to-transparent z-10"></div>
            </div>
          </div>

          {/* Second Column - Staggered down */}
          <div className="lg:mt-32">
            <ValueCard value={values[1]} index={1} locale={locale} />
          </div>

          {/* Third Column - Staggered down more */}
          <div className="lg:mt-64">
            <ValueCard value={values[2]} index={2} locale={locale} />
          </div>

          {/* Fourth Column - Staggered down most */}
          <div className="lg:mt-96">
            <ValueCard value={values[3]} index={3} locale={locale} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueCard({
  value,
  index,
  locale,
}: {
  value: {
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    titleEn: string;
    titleFr: string;
    subtitleEn?: string;
    subtitleFr?: string;
    descriptionEn: string;
    descriptionFr: string;
    featuresEn: string[];
    featuresFr: string[];
  };
  index: number;
  locale: string;
}) {
  const Icon = value.icon;
  const title = locale === "fr" ? value.titleFr : value.titleEn;
  const subtitle = locale === "fr" ? value.subtitleFr : value.subtitleEn;
  const description =
    locale === "fr" ? value.descriptionFr : value.descriptionEn;
  const features = locale === "fr" ? value.featuresFr : value.featuresEn;

  return (
    <div
      className="bg-white rounded-2xl p-6 lg:p-8 shadow-md hover:shadow-lg transition-all duration-300 border border-slate-200 animate-fade-in-up"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      {/* Icon and Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-600 rounded-xl shrink-0">
          <Icon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-slate-900 leading-tight">
          {title}
        </h3>
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-base font-semibold text-blue-600 mb-4">
          {subtitle}
        </p>
      )}

      {/* Description */}
      <p className="text-sm md:text-base text-slate-600 mb-6 leading-relaxed text-justify whitespace-pre-line">
        {description}
      </p>

      {/* Features List - Simple bullets */}
      {features.length > 0 && (
        <ul className="space-y-4">
          {features.map((feature, i) => (
            <li
              key={i}
              className="flex items-center gap-2 text-sm text-slate-700"
            >
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
