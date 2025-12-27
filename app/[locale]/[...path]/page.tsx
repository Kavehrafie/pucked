// this page catch puck page to render

import { Render } from "@measured/puck";
import { getConfig } from "@/puck.config";
import { getPageByFullPath, getPageContent } from "@/lib/page";
import { notFound } from "next/navigation";
import type { PuckData } from "@/types/puck";

export default async function PuckPage({ params }: { params: Promise<{ locale: string; path: string[] }> }) {
  const { locale, path } = await params;
  const fullPath = path.length > 0 ? path.join("/") : "home";
  const page = await getPageByFullPath(fullPath);

  if (!page) {
    notFound();
  }

  const content = await getPageContent(page.id, locale);
  const data = (content?.content || { root: { props: {}, children: [] } }) as PuckData;
  const puckConfig = getConfig(locale);

  return <Render data={data} config={puckConfig} />;
}