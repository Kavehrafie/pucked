import { GuestNavbar } from "./guest-navbar";
import { GuestFooter } from "./guest-footer";
import { getFlatMenuList } from "@/lib/page-tree";
import { getSiteSettings } from "@/lib/site-settings";
import { GuestTemplateClient } from "./guest-template-client";

export async function GuestTemplate({
  children,
  showNavbar = true,
  showFooter = true,
  locale = "en",
}: {
  children: React.ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  locale?: string;
}) {
  // Fetch menu data server-side
  const menuItems = showNavbar ? await getFlatMenuList(locale) : [];
  const settings = (showNavbar || showFooter) ? await getSiteSettings() : null;

  return (
    <GuestTemplateClient
      showNavbar={showNavbar}
      showFooter={showFooter}
      menuItems={menuItems}
      siteName={settings?.siteName || { en: "Pucked", fa: "پاکد" }}
      logoUrl={settings?.logoUrl || ""}
      settings={settings}
    >
      {children}
    </GuestTemplateClient>
  );
}