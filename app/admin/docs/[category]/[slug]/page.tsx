import { notFound } from 'next/navigation';
import { getDocBySlug, getAllDocs } from '@/lib/markdown/parser';
import { DocViewer } from '@/components/markdown';
import { requireAuth } from '@/lib/route-guard';
import type { Metadata } from 'next';
import { DocTocAsideClientWrapper } from '@/components/markdown/doc-toc-aside-client-wrapper';

type Props = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  
  const doc = getDocBySlug(slug, category as 'dev' | 'user');

  if (!doc) {
    return {
      title: 'Document Not Found',
    };
  }

  return {
    title: doc.metadata.title,
    description: doc.metadata.description,
  };
}

export async function generateStaticParams() {
  const docs = getAllDocs();
  
  return docs.map((doc) => ({
    category: doc.category,
    slug: doc.slug,
  }));
}

export default async function DocPage({ params }: Props) {
  await requireAuth({ requireInvitation: true });
  const { category, slug } = await params;
  if (category !== 'dev' && category !== 'user') notFound();
  const doc = getDocBySlug(slug, category as 'dev' | 'user');
  if (!doc) notFound();

  return (
    <div className="flex flex-col xl:flex-row gap-8 w-full">
      <div className="flex-1 min-w-0">
        <DocViewer doc={doc} />
      </div>
      <aside className="hidden xl:block w-72 shrink-0">
        <DocTocAsideClientWrapper content={doc.content} />
      </aside>
    </div>
  );
}
