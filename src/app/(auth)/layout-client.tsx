"use client";

import { PageTransition } from "@/components/PageTransition";

export default function AuthLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition>{children}</PageTransition>;
}
