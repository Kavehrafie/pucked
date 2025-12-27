"use client";

import { usePathname } from "next/navigation";
import { GuestTemplate } from "@/components/guest-template";
import { ReactNode } from "react";

interface LocaleLayoutClientProps {
  children: ReactNode;
  locale: string;
}

export function LocaleLayoutClient({ children, locale }: LocaleLayoutClientProps) {
  const pathname = usePathname();
  
  // Check if we're on an auth page
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/invitation/validate");
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return <GuestTemplate locale={locale}>{children}</GuestTemplate>;
}
