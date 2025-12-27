"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { type SiteSettings } from "@/lib/site-settings";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

interface GuestFooterProps {
  settings: SiteSettings;
}

export function GuestFooter({ settings }: GuestFooterProps) {
  const locale = useLocale();
  const t = useTranslations("Footer");
  const isRTL = locale === "fa";

  const socialLinks = settings.socialLinks || {};
  const quickLinks = settings.footerQuickLinks?.[locale as keyof typeof settings.footerQuickLinks] || [];

  // Filter out empty social links
  const filteredSocialLinks = Object.fromEntries(
    Object.entries(socialLinks).filter(([, url]) => url && url.trim() !== '')
  );

  const socialIcons = {
    twitter: Twitter,
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
  };

  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Site Info */}
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="text-lg font-semibold mb-4">
              {settings.siteName[locale as keyof typeof settings.siteName] ||
               settings.siteName.en}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("copyright")}
            </p>
          </div>

          {/* Quick Links */}
          {quickLinks.length > 0 && (
            <div className={isRTL ? "text-right" : "text-left"}>
              <h4 className="text-sm font-semibold mb-4">{t("quickLinks")}</h4>
              <ul className="space-y-2">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.url}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Links */}
          {Object.keys(filteredSocialLinks).length > 0 && (
            <div className={isRTL ? "text-right" : "text-left"}>
              <h4 className="text-sm font-semibold mb-4">{t("socialLinks")}</h4>
              <div className={`flex gap-4 ${isRTL ? "justify-end" : "justify-start"}`}>
                {Object.entries(filteredSocialLinks).map(([platform, url]) => {
                  const Icon = socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) return null;

                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={`Follow us on ${platform}`}
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-center text-muted-foreground">
            {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
