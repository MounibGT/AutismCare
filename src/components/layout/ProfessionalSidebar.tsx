"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  User,
  Calendar,
  FileText,
  Settings,
  BookOpen,
  Users,
  BarChart3,
  HelpCircle,
  LogOut,
  ChevronRight,
  Wallet,
  Star,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import Image from "next/image";

export function ProfessionalSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const t = useTranslations("Dashboard.sidebar");

  const navigationItems = [
    {
      title: t("dashboard"),
      items: [
        {
          title: t("overview"),
          url: "/professional/dashboard",
          icon: Home,
        },
        {
          title: t("profile"),
          url: "/professional/dashboard/profile",
          icon: User,
        },
        {
          title: t("schedule"),
          url: "/professional/dashboard/schedule",
          icon: Calendar,
        },
        {
          title: t("billing"),
          url: "/professional/dashboard/billing",
          icon: Wallet,
        },
      ],
    },
    {
      title: t("clientManagement"),
      items: [
        {
          title: t("proposals"),
          url: "/professional/dashboard/proposals",
          icon: Star,
        },
        {
          title: t("myClients"),
          url: "/professional/dashboard/clients",
          icon: Users,
        },
        {
          title: t("sessions"),
          url: "/professional/dashboard/sessions",
          icon: FileText,
        },
      ],
    },
    {
      title: t("resources"),
      items: [
        {
          title: t("library"),
          url: "/professional/dashboard/library",
          icon: BookOpen,
        },
        {
          title: t("analytics"),
          url: "/professional/dashboard/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: t("support"),
      items: [
        {
          title: t("helpCenter"),
          url: "/professional/dashboard/help",
          icon: HelpCircle,
        },
        {
          title: t("settings"),
          url: "/professional/dashboard/settings",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-xl font-light text-foreground"
        >
          {state === "expanded" && (
            <div className="flex items-center gap-2">
              <Image
                src="/Picture2.png"
                alt={t("logo")}
                className="h-8 w-8 object-contain"
                width={32}
                height={32}
              />
              <span className="text-lg font-semibold">AutismCare</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-xs font-light tracking-wider text-muted-foreground/70">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        className="font-light transition-colors"
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {isActive && (
                            <ChevronRight className="ml-auto h-4 w-4" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut()}
              className="font-light cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("logout")}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
