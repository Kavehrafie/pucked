// this page catch puck page to render

import dynamic from 'next/dynamic';
import { getPageByFullPath, getPageContentWithFallback } from "@/lib/page";
import { notFound, redirect } from "next/navigation";
import type { PuckData } from "@/types/puck";

// Dynamic import for client-side Puck rendering
const PuckRender = dynamic(() => import('@/components/puck-render').then(mod => ({ default: mod.PuckRender })), {
  loading: () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Loading page...</p>
      </div>
    </div>
  ),
});

export default async function PuckPage({ params }: { params: Promise<{ locale: string; path: string[] }> }) {
  const { locale, path } = await params;
  const fullPath = path.length > 0 ? path.join("/") : "home";
  const page = await getPageByFullPath(fullPath);

  if (!page) {
    notFound();
  }

  // Get the content for this locale with fallback logic
  const contentResult = await getPageContentWithFallback(page.id, locale);

  if (!contentResult) {
    // No published translation exists - show 404
    notFound();
  }

  // If we're using a fallback translation, redirect to that locale
  if (contentResult.fallbackLocale && contentResult.fallbackLocale !== locale) {
    const redirectPath = path.length > 0 ? `/${contentResult.fallbackLocale}/${path.join("/")}` : `/${contentResult.fallbackLocale}`;
    redirect(redirectPath);
  }

  const data = (contentResult.translation.content || { root: { props: {}, children: [] } }) as PuckData;

  return <PuckRender data={data} locale={locale} />;
}