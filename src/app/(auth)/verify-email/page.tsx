"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api-client";
import { authAPI as apiClientAuth } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Keyboard,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  AuthContainer,
  AuthHeader,
  AuthCard,
  AuthFooter,
} from "@/components/auth";

function VerifyEmailContent() {
  const t = useTranslations("Auth.verifyEmail");
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeParam = searchParams.get("code");
  const emailParam = searchParams.get("email");

  const [email, setEmail] = useState(emailParam || "");
  const [code, setCode] = useState(codeParam || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email.trim() || !code.trim()) {
      setError("Email and verification code are required");
      setIsLoading(false);
      return;
    }

    if (code.length !== 6) {
      setError("Verification code must be 6 digits");
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiClientAuth.verifyEmail(code, email);
      setSuccess(true);
    } catch (err: unknown) {
      setAttempts((prev) => prev + 1);
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 1) {
      const newCode = code.split("");
      newCode[index] = value;
      const newCodeStr = newCode.join("");
      setCode(newCodeStr);

      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedData.length === 6) {
      setCode(pastedData);
      e.preventDefault();
    }
  };

  if (success) {
    return (
      <AuthContainer>
        <AuthHeader
          icon={<CheckCircle2 className="w-8 h-8 text-green-500" />}
          title={t("successTitle")}
          description={t("successDescription")}
        />
        <AuthCard>
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
              <p className="text-sm text-green-800 dark:text-green-200">
                {t("verifiedMessage")}
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-base font-light tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <ArrowRight className="w-5 h-5" />
              <span>{t("goToLogin")}</span>
            </Link>
          </div>
        </AuthCard>
        <AuthFooter>
          <Link
            href="/"
            className="text-sm text-muted-foreground font-light hover:text-foreground transition-colors"
          >
            {t("backToHome")}
          </Link>
        </AuthFooter>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer maxWidth="md">
      <AuthHeader
        icon={<Mail className="w-8 h-8 text-primary" />}
        title={t("title")}
        description={t("description")}
      />

      <AuthCard>
        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {t("emailLabel")}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
              placeholder={t("emailPlaceholder")}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Keyboard className="h-4 w-4 text-muted-foreground" />
              {t("codeLabel")}
            </Label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className="w-12 h-12 text-center text-lg font-semibold"
                  value={code[index] || ""}
                  onChange={(e) => handleCodeChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {t("codeHint")}
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length !== 6 || !email}
            className="group w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full text-base font-light tracking-wide transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t("verifying")}</span>
              </>
            ) : (
              <>
                <span>{t("verifyButton")}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </AuthCard>

      <AuthFooter>
        <p className="text-sm text-muted-foreground font-light">
          {t("noCode")}{" "}
          <Link href="/forgot-password" className="text-primary hover:text-primary/80">
            {t("requestNew")}
          </Link>
        </p>
      </AuthFooter>

      <AuthFooter>
        <Link
          href="/login"
          className="text-sm text-muted-foreground font-light hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          {t("backToLogin")}
        </Link>
      </AuthFooter>
    </AuthContainer>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <AuthContainer>
        <AuthHeader
          icon={<Mail className="w-8 h-8 text-primary" />}
          title="Loading..."
          description="Please wait"
        />
        <AuthCard>
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </AuthCard>
      </AuthContainer>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
