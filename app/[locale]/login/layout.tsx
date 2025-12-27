import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LoginLayout({ children, params }: Props) {
  const { locale } = await params;
  const dir = locale === "fa" ? "rtl" : "ltr";

  return (
    <NextIntlClientProvider locale={locale}>
      <div lang={locale} dir={dir} className="min-h-screen">
        {children}
      </div>
    </NextIntlClientProvider>
  );
}
