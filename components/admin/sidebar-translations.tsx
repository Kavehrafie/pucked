"use client";

import { usePageSelection } from "@/components/admin/page-selection-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Globe } from "lucide-react";
import Link from "next/link";

interface TranslationStatus {
  locale: string;
  published: boolean;
  hasContent: boolean;
}

interface SidebarTranslationsProps {
  translations?: TranslationStatus[];
}

export function SidebarTranslations({ translations = [] }: SidebarTranslationsProps) {
  const { selectedPage } = usePageSelection();

  if (!selectedPage) {
    return null;
  }

  const pageSlug = selectedPage.slug || selectedPage.id;
  const availableLocales = ["en", "fa"];
  const existingLocales = new Set(translations.map((t) => t.locale));
  const missingLocales = availableLocales.filter((locale) => !existingLocales.has(locale));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Globe className="w-4 h-4" />
        <h3 className="text-sm font-semibold">Translations</h3>
      </div>

      {/* Existing translations */}
      {translations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Existing translations</p>
          <div className="space-y-2">
            {translations.map((translation) => (
              <div
                key={translation.locale}
                className="flex items-center justify-between p-2 rounded-md border bg-card"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    {translation.locale === "en" ? "English" : "Farsi"}
                  </span>
                  <Badge
                    variant={translation.published ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {translation.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="h-7 text-xs"
                >
                  <Link
                    href={`/admin/pages/${translation.locale}/${pageSlug}/edit`}
                  >
                    Edit
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing translations */}
      {missingLocales.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Create translation</p>
          <div className="space-y-2">
            {missingLocales.map((locale) => (
              <Button
                key={locale}
                variant="outline"
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link
                  href={`/admin/pages/${locale}/${pageSlug}/edit`}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {locale === "en" ? "English" : "Farsi"}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* No translations message */}
      {translations.length === 0 && missingLocales.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No translations available
        </p>
      )}
    </div>
  );
}
