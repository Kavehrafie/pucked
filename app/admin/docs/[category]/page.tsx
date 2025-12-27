import { notFound } from 'next/navigation';
import { parseCategoryDocs } from '@/lib/markdown/parser';
import { DocList, DocsNav } from '@/components/markdown';
import { requireAuth } from '@/lib/route-guard';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  
  const titles = {
    dev: 'Developer Documentation',
    user: 'User Documentation',
  };

  const descriptions = {
    dev: 'Technical guides and API documentation for developers',
    user: 'User guides and documentation for using the application',
  };

  const title = titles[category as keyof typeof titles];
  const description = descriptions[category as keyof typeof descriptions];

  if (!title || !description) {
    return {
      title: 'Documentation',
    };
  }

  return {
    title,
    description,
  };
}

export default async function CategoryDocsPage({ params }: Props) {
  await requireAuth({ requireInvitation: true });
  
  const { category } = await params;

  // Validate category
  if (category !== 'dev' && category !== 'user') {
    notFound();
  }

  const docs = parseCategoryDocs(category);

  const titles = {
    dev: 'Developer Documentation',
    user: 'User Documentation',
  };

  const descriptions = {
    dev: 'Technical guides, API references, and development documentation',
    user: 'User guides, tutorials, and documentation for using the application',
  };

  return (
    <div className="container py-8">
      
      <DocList
        docs={docs}
        title={titles[category as keyof typeof titles]}
        description={descriptions[category as keyof typeof descriptions]}
      />
    </div>
  );
}
