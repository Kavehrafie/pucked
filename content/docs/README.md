# Markdown Documentation System

Complete documentation system for the Pucked application with support for developer and user documentation.

## Features

- ✅ **Markdown Rendering** with GitHub Flavored Markdown (GFM)
- ✅ **Frontmatter Support** for metadata (title, description, tags, etc.)
- ✅ **Syntax Highlighting** for code blocks
- ✅ **Admin-Only** (English-only, no locale prefix)
- ✅ **Categorized Docs** (dev and user)
- ✅ **Searchable** by tags and categories
- ✅ **Responsive Design** with dark mode
- ✅ **Static Generation** for optimal performance

## Directory Structure

```
content/
└── docs/
    ├── dev/           # Developer documentation
    │   ├── getting-started.md
    │   ├── authentication.md
    │   └── ...
    └── user/          # User documentation
        ├── quick-start.md
        ├── page-builder.md
        └── ...
```

## Frontmatter Schema

Each markdown file should include frontmatter with the following fields:

```yaml
---
title: Document Title
description: Brief description of the document
order: 1
category: Category Name
tags:
  - tag1
  - tag2
lastModified: 2025-12-27
author: Author Name
---
```

### Required Fields

- `title`: The document title

### Optional Fields

- `description`: Brief description for SEO and listings
- `order`: Numeric order for sorting (lower numbers appear first)
- `category`: Category name for grouping
- `tags`: Array of tags for filtering
- `lastModified`: ISO date string (YYYY-MM-DD)
- `author`: Author name

## Usage

### Creating New Documentation

1. **Create a markdown file** in the appropriate directory:
   - `content/docs/dev/` for developer docs
   - `content/docs/user/` for user docs

2. **Add frontmatter** at the top of the file:

```markdown
---
title: Your Document Title
description: A brief description
order: 1
tags:
  - example
  - tutorial
---

# Your Content

Your markdown content goes here...
```

3. **The document is automatically available** at:
   - `/admin/docs/dev/your-document-title` (for dev docs)
   - `/admin/docs/user/your-document-title` (for user docs)

### Accessing Documentation

- **All Docs**: `/admin/docs`
- **Dev Docs**: `/admin/docs/dev`
- **User Docs**: `/admin/docs/user`
- **Specific Doc**: `/admin/docs/dev/getting-started`

### Programmatic Usage

```typescript
import { 
  getAllDocs, 
  parseCategoryDocs, 
  getDocBySlug,
  getDocsByTag 
} from '@/lib/markdown/parser';

// Get all documentation
const allDocs = getAllDocs();

// Get docs by category
const devDocs = parseCategoryDocs('dev');
const userDocs = parseCategoryDocs('user');

// Get specific doc
const doc = getDocBySlug('getting-started', 'dev');

// Get docs by tag
const taggedDocs = getDocsByTag('tutorial');
```

## Components

### MarkdownRenderer

Client-side markdown renderer with syntax highlighting.

```tsx
import { MarkdownRenderer } from '@/components/markdown';

<MarkdownRenderer content="# Hello World" />
```

### DocViewer

Display a single documentation page with metadata.

```tsx
import { DocViewer } from '@/components/markdown';

<DocViewer doc={doc} />
```

### DocList

Display a list of documentation pages.

```tsx
import { DocList } from '@/components/markdown';

<DocList 
  docs={docs}
  title="Documentation"
  description="Browse all documentation"
/>
```

### DocsNav

Navigation for documentation sections.

```tsx
import { DocsNav } from '@/components/markdown';

<DocsNav currentCategory="dev" />
```

## Markdown Features

### Supported Syntax

- **Headings**: `# H1`, `## H2`, `### H3`, etc.
- **Bold**: `**bold**` or `__bold__`
- **Italic**: `*italic*` or `_italic_`
- **Strikethrough**: `~~strikethrough~~`
- **Links**: `[text](url)`
- **Images**: `![alt](image-url)`
- **Lists**: Bullet and numbered lists
- **Code**: Inline `code` and code blocks
- **Blockquotes**: `> quote`
- **Tables**: GitHub Flavored Markdown tables
- **Horizontal Rules**: `---`

### Code Blocks

Syntax highlighting is automatic based on the language:

````markdown
```javascript
function hello() {
  console.log("Hello, World!");
}
```
````

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
```

### Blockquotes

```markdown
> This is a blockquote
> with multiple lines
```

## Styling

The documentation uses Tailwind CSS with custom styles for:

- **Typography**: Optimized for readability
- **Code Blocks**: Syntax highlighting with light/dark themes
- **Tables**: Clean, responsive tables
- **Links**: Underlined with hover effects
- **Blockquotes**: Styled with left border

### Custom Styles

Styles are defined in `app/globals.css`:

```css
/* Markdown Content Styles */
.markdown-content {
  @apply prose prose-neutral dark:prose-invert max-w-none;
}

/* Syntax Highlighting */
.hljs {
  background: oklch(0.98 0 0);
  color: oklch(0.2 0 0);
}
```

## Admin-Only Documentation

Documentation is located in the admin area and is English-only:

- **No Locale Prefix**: Routes are `/admin/docs/*` (not `/en/docs/*` or `/fa/docs/*`)
- **Authentication Required**: Users must be logged in to access documentation
- **Admin Design System**: Uses Puck components and admin styling

## Performance

- **Static Generation**: Pages are generated at build time
- **Incremental Static Regeneration**: Updates on content changes
- **Optimized Images**: Automatic image optimization
- **Code Splitting**: Components are loaded on demand

## Best Practices

### Writing Documentation

1. **Use Clear Titles**: Make them descriptive and concise
2. **Add Descriptions**: Help with SEO and navigation
3. **Use Tags**: Enable filtering and search
4. **Order Content**: Use the `order` field for sorting
5. **Update Dates**: Keep `lastModified` current
6. **Code Examples**: Use syntax highlighting
7. **Internal Links**: Reference other docs

### Organizing Content

1. **Categorize Properly**: Dev vs User docs
2. **Logical Structure**: Group related topics
3. **Progressive Disclosure**: Start simple, go deeper
4. **Cross-Reference**: Link to related docs
5. **Maintain Consistency**: Use similar structure across docs

### Frontmatter Tips

```yaml
---
# Required
title: Clear, Descriptive Title

# Recommended
description: One or two sentences explaining what the doc covers
order: 10  # Lower numbers appear first
tags: [feature, tutorial]  # 3-5 relevant tags

# Optional
category: Development  # For grouping
lastModified: 2025-12-27  # Update when you edit
author: Your Name  # For attribution
---
```

## Troubleshooting

### Document Not Appearing

1. Check the file is in the correct directory (`dev/` or `user/`)
2. Verify the file has `.md` extension
3. Ensure frontmatter is valid YAML
4. Restart the development server

### Styling Issues

1. Clear browser cache
2. Check for conflicting CSS
3. Verify Tailwind classes are correct
4. Inspect element for applied styles

### Build Errors

1. Check markdown syntax is valid
2. Verify frontmatter YAML is correct
3. Look for special characters that need escaping
4. Check console for specific error messages

## Libraries Used

- **react-markdown**: Markdown rendering
- **remark-gfm**: GitHub Flavored Markdown support
- **rehype-highlight**: Syntax highlighting
- **rehype-raw**: HTML support in markdown
- **gray-matter**: Frontmatter parsing

## Future Enhancements

- [ ] Full-text search
- [ ] Table of contents generation
- [ ] Breadcrumb navigation
- [ ] Print-friendly styles
- [ ] PDF export
- [ ] Version history
- [ ] Contributor attribution
- [ ] Reading time estimation
- [ ] Related documents suggestions
- [ ] Dark mode toggle persistence

## Contributing

When adding new documentation:

1. Choose the appropriate category (dev or user)
2. Use the template below
3. Follow the naming convention (lowercase-with-hyphens)
4. Add relevant tags
5. Update this README if adding new features

### Template

```markdown
---
title: Document Title
description: Brief description
order: 10
tags:
  - tag1
  - tag2
lastModified: YYYY-MM-DD
author: Your Name
---

# Title

Brief introduction.

## Section 1

Content...

## Section 2

Content...

## Conclusion

Summary...
```

## License

Part of the Pucked project. See main project LICENSE for details.
