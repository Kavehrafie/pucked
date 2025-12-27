---
title: Using the Page Builder
description: Learn how to use the visual page builder to create beautiful pages without coding.
order: 2
category: User Guide
tags:
  - page-builder
  - visual-editor
  - components
  - tutorial
lastModified: 2025-12-27
author: Pucked Team
---

# Using the Page Builder

The Page Builder is a powerful visual editor that lets you create beautiful pages without writing any code. This guide will walk you through all its features.

## Interface Overview

```
┌─────────────────────────────────────────────────────────┐
│  Header: Save | Preview | Publish                        │
├──────────┬──────────────────────────────┬───────────────┤
│          │                              │               │
│  Page    │      Canvas Area             │  Properties   │
│  Tree    │      (Your Page)             │  Panel        │
│          │                              │               │
│          │                              │               │
└──────────┴──────────────────────────────┴───────────────┘
```

### Left Sidebar - Page Tree

Shows the hierarchical structure of your pages:

- **Expand/Collapse**: Click arrows to show/hide child pages
- **Select Page**: Click to edit a page
- **Drag to Reorder**: Reorganize your page structure
- **Add New**: Create new pages or subpages

### Center - Canvas Area

The main editing area where you build your page:

- **Visual Editor**: See your page as it will appear
- **Drag & Drop**: Move components around
- **Inline Editing**: Click text to edit directly
- **Component Zones**: Drop zones for adding components

### Right Sidebar - Properties Panel

Configure settings for the selected component or page:

- **Page Settings**: URL, title, metadata
- **Component Properties**: Style, content, behavior
- **Translations**: Manage bilingual content

## Working with Components

### Adding Components

1. **Click the "+" button** in a component zone
2. **Select a component** from the palette
3. **The component appears** on your page

### Available Components

#### 📝 Heading

Add titles and section headers.

**Properties:**
- **Level**: H1, H2, H3, H4, H5, or H6
- **Text**: The heading text
- **Alignment**: Left, center, or right

**Best Practices:**
- Use H1 for the main page title (only one per page)
- Use H2 for major sections
- Use H3-H6 for subsections

#### 📄 Text Block

Add paragraphs and formatted text.

**Properties:**
- **Content**: Rich text editor with formatting options
- **Alignment**: Text alignment

**Formatting Options:**
- **Bold**, *italic*, ~~strikethrough~~
- Bullet lists and numbered lists
- Links to internal or external pages

#### 📐 Grid

Create multi-column layouts.

**Properties:**
- **Columns**: 2, 3, or 4 columns
- **Gap**: Spacing between columns

**Use Cases:**
- Feature lists
- Team member profiles
- Product showcases
- Image galleries

#### 🔗 Link

Add navigation links or buttons.

**Properties:**
- **Label**: Link text
- **URL**: Target URL (internal or external)
- **Style**: Button or text link
- **Variant**: Primary, secondary, or ghost

**Tips:**
- Use primary style for main CTAs
- Use secondary for alternative actions
- Use ghost for subtle links

#### 📏 Spacer

Add vertical space between components.

**Properties:**
- **Height**: Space in pixels (16-128px)

**When to Use:**
- Between sections
- Before/after headings
- Around images
- To create visual breathing room

#### ✍️ Rich Text (TipTap)

Advanced text editing with more formatting options.

**Features:**
- All text block features
- Additional formatting options
- Better for complex content

### Editing Components

1. **Select the component** by clicking on it
2. **Edit properties** in the right panel
3. **See changes** in real-time

### Deleting Components

1. **Select the component**
2. **Click the delete icon** (trash can)
3. **Confirm deletion**

⚠️ **Note**: This action cannot be undone!

### Reordering Components

**Within a Zone:**
- Click and drag the component handle
- Drop it in the new position

**Between Zones:**
- Drag the component to a different zone
- Release to place it

## Page Settings

### Basic Settings

- **Title**: Page title (appears in browser tab)
- **Slug**: URL path (e.g., `/about-us`)
- **Description**: Meta description for SEO

### Advanced Settings

- **Show in Navigation**: Include in site menu
- **Parent Page**: Organize as a subpage
- **Publish Status**: Draft or published

## Working with Pages

### Creating a New Page

1. Click **"New Page"** in the header
2. Enter page details
3. Click **"Create"**

### Duplicating a Page

1. Select the page in the tree
2. Click **"Duplicate"**
3. Edit the copy as needed

### Deleting a Page

1. Select the page in the tree
2. Click **"Delete"**
3. Confirm deletion

⚠️ **Warning**: You cannot delete pages with child pages. Delete child pages first.

## Managing Translations

Pucked supports bilingual content (English and Farsi).

### Adding Translations

1. Select a page or component
2. Click the **"Translations"** tab
3. Select the target language
4. Enter the translated content
5. Save

### Language Switching

- Use the language selector in the header
- Switch between English (LTR) and Farsi (RTL)
- Farsi content automatically uses right-to-left layout

### Translation Best Practices

1. **Translate Key Pages**: Start with important pages
2. **Maintain Structure**: Keep similar layouts across languages
3. **Cultural Context**: Consider cultural differences
4. **Test Both Languages**: Preview in both languages

## Saving and Publishing

### Saving Your Work

- **Auto-Save**: Changes save automatically
- **Manual Save**: Click "Save" or press Ctrl+S
- **Save Status**: Indicator shows if there are unsaved changes

### Previewing

1. Click **"Preview"** in the header
2. See how your page looks to visitors
3. Test on different screen sizes

### Publishing

1. Click **"Publish"** in the header
2. Confirm publication
3. Your page is now live!

**Publishing Options:**
- **Publish Now**: Make live immediately
- **Schedule**: Set a future publish date (coming soon)

## Tips and Tricks

### Keyboard Shortcuts

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Save | Ctrl + S | Cmd + S |
| Undo | Ctrl + Z | Cmd + Z |
| Redo | Ctrl + Shift + Z | Cmd + Shift + Z |
| Preview | Ctrl + P | Cmd + P |

### Best Practices

1. **Plan Your Structure**: Outline pages before building
2. **Use Consistent Spacing**: Maintain visual rhythm
3. **Test on Mobile**: Check responsive design
4. **Use Headings**: Organize content with clear hierarchy
5. **Add Descriptions**: Help with SEO
6. **Preview Often**: Catch issues early

### Common Patterns

#### Landing Page

```
H1: Hero Title
Text: Hero Description
Button: CTA
Spacer
Grid: Features
Spacer
H2: About
Text: Description
```

#### Blog Post

```
H1: Post Title
Text: Meta info (date, author)
Spacer
Text: Content
Text: More content
Spacer
H2: Section
Text: Section content
```

#### Contact Page

```
H1: Contact Us
Text: Description
Spacer
Grid: Contact info
Spacer
H2: Send Message
Text: Form instructions
```

## Troubleshooting

### Component Not Appearing

- Check if the page is published
- Verify the component is in a visible zone
- Clear browser cache and refresh

### Changes Not Saving

- Check your internet connection
- Try refreshing the page
- Contact support if issue persists

### Layout Issues on Mobile

- Use fewer columns in grids
- Reduce spacer height
- Test with different screen sizes

### Translation Not Showing

- Ensure translation is saved
- Check language selector
- Verify page is published

## Advanced Features

### Custom Styling (Coming Soon)

- Custom CSS classes
- Theme customization
- Brand colors

### Component Templates (Coming Soon)

- Pre-built layouts
- Industry-specific templates
- One-click page creation

### Collaboration (Coming Soon)

- Multiple editors
- Comments and feedback
- Version history

## Getting Help

### Documentation

- [Quick Start Guide](/docs/user/quick-start)
- [Component Reference](/docs/user/components)
- [FAQ](/docs/user/faq)

### Support

- Contact your administrator
- Report bugs
- Request features

## Conclusion

The Page Builder gives you the power to create professional pages without coding. Experiment with different components and layouts to find what works best for your content.

Happy building! 🎨
