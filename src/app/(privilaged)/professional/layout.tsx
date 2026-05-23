import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ProfessionalSidebar } from "@/components/layout/ProfessionalSidebar";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { getLocale } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import IncomingCallNotifier from "@/components/call/IncomingCallModal";
import StatusToggleWrapper from "@/components/call/StatusToggleWrapper";
import AutismChatbot from "@/components/AutismChatbot";

export default async function ProfessionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "professional") {
    redirect("/login");
  }

  const locale = await getLocale();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <ProfessionalSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border/40 bg-background px-4 sm:px-6">
            <SidebarTrigger />
            <div className="flex-1" />
            <StatusToggleWrapper />
            <LocaleSwitcher currentLocale={locale} />
          </div>
          <div className="p-6 w-full">{children}</div>
        </main>
      </div>
      <IncomingCallNotifier />
      <AutismChatbot />
    </SidebarProvider>
  );
}
