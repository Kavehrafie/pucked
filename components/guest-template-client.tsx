"use client";

import { GuestNavbar } from "./guest-navbar";
import { GuestFooter } from "./guest-footer";

interface GuestTemplateClientProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  menuItems: any[];
  siteName: { en: string; fa: string };
  logoUrl: string;
  settings: any;
}

export function GuestTemplateClient({
  children,
  showNavbar = true,
  showFooter = true,
  menuItems,
  siteName,
  logoUrl,
  settings,
}: GuestTemplateClientProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showNavbar && <GuestNavbar menuItems={menuItems} siteName={siteName} logoUrl={logoUrl} />}
      <main className="flex-1">{children}</main>
      {showFooter && settings && <GuestFooter settings={settings} />}
    </div>
  );
}
