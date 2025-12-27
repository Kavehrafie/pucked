import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { LocaleLayoutClient } from "@/components/locale-layout-client";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider locale={locale}>
      {/* Wrapper div with lang and dir for proper RTL support */}
      <div lang={locale} dir={dir} className="min-h-screen">
        <LocaleLayoutClient locale={locale}>{children}</LocaleLayoutClient>
      </div>
    </NextIntlClientProvider>
  );
}