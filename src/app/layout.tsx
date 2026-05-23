import type { Metadata } from "next";
import "./globals.css";
import { Petrona } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { Providers } from "@/components/providers";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";

// Use full-featured ADI chatbot with dynamic import
const ADIChatbot = dynamic(
  () => import("@/components/ADIChatbot"),
  { loading: () => null }
);

const petrona = Petrona({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AutismeCare - Integrated Health Platform",
  description:
    "Your journey to better health and wellness with our comprehensive platform featuring mental health support, primary care, and employee assistance programs.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${petrona.className} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <Providers>{children}</Providers>
          <Footer />
          <ADIChatbot />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
