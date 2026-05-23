"use client";

import Link from "next/link";
import { Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations("Footer");

  return (
    <footer className="w-full bg-primary text-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-1">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Image
                width={256}
                height={256}
                src="/picture2.png"
                alt="AutismeCare"
                className="h-12 w-auto"
              />
              <span className="font-semibold text-lg text-background">AutismeCare</span>
            </Link>
          </div>

          {/* Partners */}
          <div className="text-secondary">
            <h3 className="text-lg font-semibold mb-6">{t("partners")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/partner"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("partnerWithUs")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t("company")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("careers")}
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("press")}
                </Link>
              </li>
              <li>
                <Link
                  href="/culture"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("culture")}
                </Link>
              </li>
              <li>
                <Link
                  href="/brand"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("brandGuidelines")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t("platform")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/platform"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("integratedHealthPlatform")}
                </Link>
              </li>
              <li>
                <Link
                  href="/eap"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("eap")}
                </Link>
              </li>
              <li>
                <Link
                  href="/mental-health"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("mentalHealthPlus")}
                </Link>
              </li>
              <li>
                <Link
                  href="/primary-care"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("primaryCareWellness")}
                </Link>
              </li>
              <li>
                <Link
                  href="/calculator"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("eapCalculator")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">{t("contact")}</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/ios"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("ios")}
                </Link>
              </li>
              <li>
                <Link
                  href="/android"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("android")}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("helpCentre")}
                </Link>
              </li>
              <li>
                <Link
                  href="/status"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("status")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-white/70 hover:text-white transition-colors"
                >
                  {t("contactUs")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
              <span>{t("copyright", { year: currentYear })}</span>
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                {t("privacyPolicy")}
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                {t("termsOfUse")}
              </Link>
              <Link href="/aoda" className="hover:text-white transition-colors">
                {t("aoda")}
              </Link>
              <Link
                href="/cookie-policy"
                className="hover:text-white transition-colors"
              >
                {t("cookiePolicy")}
              </Link>
              <Link
                href="/rights"
                className="hover:text-white transition-colors"
              >
                {t("rightsAndResponsibilities")}
              </Link>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
