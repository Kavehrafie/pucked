import { getAllDocs } from '@/lib/markdown/parser';
import { DocList, DocsNav } from '@/components/markdown';
import { requireAuth } from '@/lib/route-guard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Documentation',
  description: 'Browse all documentation for the Pucked application',
};

export default async function DocsPage() {
  await requireAuth({ requireInvitation: true });
  const allDocs = getAllDocs();

  return (
    <div className="flex-1">
      <DocList
        docs={allDocs}
        title="All Documentation"
        description="Comprehensive guides and documentation for developers and users"
      />
    </div>
  );
}
