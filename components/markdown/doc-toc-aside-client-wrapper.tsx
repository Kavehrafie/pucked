"use client";
import dynamic from 'next/dynamic';
const DocTocAside = dynamic(() => import('./doc-toc-aside').then(m => m.DocTocAside), { ssr: false });

export function DocTocAsideClientWrapper({ content }: { content: string }) {
  return <DocTocAside content={content} />;
}