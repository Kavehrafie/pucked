"use client";

import { usePathname } from "next/navigation";
import { GuestNavbar } from "./guest-navbar";
import { GuestFooter } from "./guest-footer";
import { ReactNode } from "react";

interface LocaleLayoutClientProps {
  children: ReactNode;
  locale: string;
  menuItems: any[];
  siteName: { en: string; fa: string };
  logoUrl: string;
  settings: any;
  isEditModeOn?: boolean;
}

export function LocaleLayoutClient({ 
  children, 
  locale,
  isEditModeOn,
  menuItems,
  siteName,
  logoUrl,
  settings,
}: LocaleLayoutClientProps) {
  const pathname = usePathname();
  
  // Check if we're on an auth page
  const isAuthPage = pathname?.includes("/login") || pathname?.includes("/invitation/validate");
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <GuestNavbar menuItems={menuItems} siteName={siteName} logoUrl={logoUrl} isEditModeOn={isEditModeOn} />
      <main className="flex-1 mx-auto prose md:prose-lg md:max-w-xl lg:max-w-2xl px-4 py-8 w-full">
        {children}
      </main>
      {settings && <GuestFooter settings={settings} />}
    </div>
  );
}
