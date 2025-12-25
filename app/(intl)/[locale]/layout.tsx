import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({children, params}: Props) {
  const { locale } = await params;

  console.log('🏗️ LAYOUT:', { locale });

  if (!hasLocale(routing.locales, locale)) {
    console.log('❌ INVALID LOCALE:', locale);
    notFound();
  }

  // Required: set locale for this request
  setRequestLocale(locale);

  console.log('✅ LOCALE SET:', locale);

  // Get messages for client components
  // Note: messages are optional for server-only usage

  return (
    <NextIntlClientProvider>{children}</NextIntlClientProvider>
  );
}