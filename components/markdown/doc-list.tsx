import Link from 'next/link';
import { FileText, Clock } from 'lucide-react';
import type { Doc } from '@/lib/markdown/parser';

interface DocListProps {
  docs: Doc[];
  title: string;
  description?: string;
}

/**
 * Display a list of documentation pages with metadata
 */
export function DocList({ docs, title, description }: DocListProps) {
  if (docs.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No documentation found</h3>
        <p className="text-muted-foreground">Check back later for updates.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Doc List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/admin/docs/${doc.category}/${doc.slug}`}
            className="group"
          >
            <div className="h-full rounded-lg border bg-card p-6 transition-all hover:shadow-md hover:border-primary/50">
              <div className="flex items-start justify-between gap-2 mb-4">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                  {doc.metadata.title}
                </h3>
                <span className="shrink-0 px-2 py-1 text-xs font-medium rounded-md bg-secondary text-secondary-foreground">
                  {doc.category}
                </span>
              </div>
              
              {doc.metadata.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {doc.metadata.description}
                </p>
              )}
              
              {(doc.metadata.tags || doc.metadata.lastModified) && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {doc.metadata.tags && doc.metadata.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.metadata.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 text-xs border rounded">
                          {tag}
                        </span>
                      ))}
                      {doc.metadata.tags.length > 2 && (
                        <span className="px-2 py-0.5 text-xs border rounded">
                          +{doc.metadata.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {doc.metadata.lastModified && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <time dateTime={doc.metadata.lastModified}>
                        {new Date(doc.metadata.lastModified).toLocaleDateString()}
                      </time>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
