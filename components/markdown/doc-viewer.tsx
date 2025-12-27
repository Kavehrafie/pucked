import { notFound } from 'next/navigation';
import { Calendar, User } from 'lucide-react';
import { MarkdownRenderer } from './markdown-renderer';
import type { Doc } from '@/lib/markdown/parser';

interface DocViewerProps {
  doc: Doc | null;
}

/**
 * Display a single documentation page with metadata and rendered markdown
 */
export function DocViewer({ doc }: DocViewerProps) {
  if (!doc) {
    notFound();
  }

  const { metadata, content } = doc;

  return (
    <article className="max-w-4xl">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">{metadata.title}</h1>
          
          {metadata.description && (
            <p className="text-xl text-muted-foreground">{metadata.description}</p>
          )}
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {metadata.lastModified && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <time dateTime={metadata.lastModified}>
                {new Date(metadata.lastModified).toLocaleDateString()}
              </time>
            </div>
          )}
          
          {metadata.author && (
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{metadata.author}</span>
            </div>
          )}

          {metadata.category && (
            <span className="px-2 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground">
              {metadata.category}
            </span>
          )}
        </div>

        {/* Tags */}
        {metadata.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
              <span key={tag} className="px-2 py-1 text-xs border rounded">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="rounded-lg border bg-card p-8">
        <MarkdownRenderer content={content} />
      </div>
    </article>
  );
}
