import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface DocMetadata {
  title: string;
  description?: string;
  order?: number;
  category?: string;
  tags?: string[];
  lastModified?: string;
  author?: string;
}

export interface Doc {
  metadata: DocMetadata;
  slug: string;
  content: string;
  category: 'dev' | 'user';
}

/**
 * Parse a markdown file with frontmatter
 */
export function parseMarkdownFile(
  filePath: string,
  category: 'dev' | 'user'
): Doc | null {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(fileContent);
    
    // Extract slug from filename
    const slug = path.basename(filePath, '.md');
    
    return {
      metadata: {
        title: data.title || slug,
        description: data.description,
        order: data.order,
        category: data.category,
        tags: data.tags,
        lastModified: data.lastModified,
        author: data.author,
      },
      slug,
      content,
      category,
    };
  } catch (error) {
    console.error(`Error parsing markdown file ${filePath}:`, error);
    return null;
  }
}

/**
 * Get all markdown files in a directory recursively
 */
export function getMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      files.push(...getMarkdownFiles(fullPath));
    } else if (item.isFile() && item.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Parse all markdown files in a category
 */
export function parseCategoryDocs(category: 'dev' | 'user'): Doc[] {
  const docsDir = path.join(process.cwd(), 'content', 'docs', category);
  const files = getMarkdownFiles(docsDir);
  
  const docs = files
    .map((file) => parseMarkdownFile(file, category))
    .filter((doc): doc is Doc => doc !== null);
  
  // Sort by order if available, otherwise by title
  return docs.sort((a, b) => {
    const aOrder = a.metadata.order ?? Number.MAX_SAFE_INTEGER;
    const bOrder = b.metadata.order ?? Number.MAX_SAFE_INTEGER;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    return a.metadata.title.localeCompare(b.metadata.title);
  });
}

/**
 * Get a single doc by slug and category
 */
export function getDocBySlug(
  slug: string,
  category: 'dev' | 'user'
): Doc | null {
  const docsDir = path.join(process.cwd(), 'content', 'docs', category);
  const filePath = path.join(docsDir, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    // Try to find in subdirectories
    const files = getMarkdownFiles(docsDir);
    const matchedFile = files.find(
      (file) => path.basename(file, '.md') === slug
    );
    
    if (matchedFile) {
      return parseMarkdownFile(matchedFile, category);
    }
    
    return null;
  }
  
  return parseMarkdownFile(filePath, category);
}

/**
 * Get all docs (both dev and user)
 */
export function getAllDocs(): Doc[] {
  return [
    ...parseCategoryDocs('dev'),
    ...parseCategoryDocs('user'),
  ];
}

/**
 * Get docs by tag
 */
export function getDocsByTag(tag: string): Doc[] {
  const allDocs = getAllDocs();
  
  return allDocs.filter((doc) =>
    doc.metadata.tags?.includes(tag)
  );
}
