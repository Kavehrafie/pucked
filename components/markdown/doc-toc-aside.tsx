"use client";
import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function DocTocAside({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([]);

  useEffect(() => {
    // Simple regex to extract headings (h2/h3)
    const lines = content.split("\n");
    const found: Heading[] = [];
    for (const line of lines) {
      const h2 = /^##\s+(.+)/.exec(line);
      if (h2) found.push({ id: slugify(h2[1]), text: h2[1], level: 2 });
      const h3 = /^###\s+(.+)/.exec(line);
      if (h3) found.push({ id: slugify(h3[1]), text: h3[1], level: 3 });
    }
    setHeadings(found);
  }, [content]);

  if (!headings.length) {
    return (
      <div className="sticky top-32 p-4 rounded-lg border bg-muted/50 text-muted-foreground text-xs">
        No headings found in this document.
      </div>
    );
  }

  return (
    <nav className="sticky top-32 p-4 rounded-lg border bg-muted/50">
      <div className="text-muted-foreground text-sm font-semibold mb-3">On this page</div>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id} className={h.level === 2 ? "ml-0" : "ml-4"}>
            <a
              href={`#${h.id}`}
              className="block text-sm hover:text-primary transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}