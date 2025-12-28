import { getDb } from "@/db";
import { pages, pageTranslations } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import type { MenuItem } from "@/types";

/**
 * Get the page tree for navigation menu
 * Only includes pages with showOnMenu=true and published translations
 */
export async function getMenuTree(locale: string): Promise<MenuItem[]> {
  const db = getDb();
  
  // Get all pages that should be shown on menu
  const allPages = await db.query.pages.findMany({
    where: eq(pages.showOnMenu, true),
    with: {
      translations: {
        where: and(
          eq(pageTranslations.locale, locale),
          eq(pageTranslations.published, true)
        ),
      },
    },
    orderBy: (pages, { asc }) => [asc(pages.sortOrder)],
  });

  // Filter pages that have published translations for the locale
  const pagesWithTranslations = allPages.filter(
    (page) => page.translations.length > 0
  );

  // Build tree structure
  const pageMap = new Map<number, MenuItem>();
  const rootItems: MenuItem[] = [];

  // First pass: create map of all pages
  for (const page of pagesWithTranslations) {
    const translation = page.translations[0];
    pageMap.set(page.id, {
      id: page.id,
      title: translation.title,
      slug: page.slug,
      fullPath: page.fullPath,
      children: [],
    });
  }

  // Second pass: build tree hierarchy
  for (const page of pagesWithTranslations) {
    const menuItem = pageMap.get(page.id)!;

    if (page.parentId === null) {
      // Root level item
      rootItems.push(menuItem);
    } else {
      // Child item - add to parent's children
      const parent = pageMap.get(page.parentId);
      if (parent) {
        parent.children.push(menuItem);
      }
    }
  }

  return rootItems;
}

/**
 * Get a flat list of menu items (for simple navigation)
 */
export async function getFlatMenuList(locale: string): Promise<MenuItem[]> {
  const tree = await getMenuTree(locale);

  function flatten(items: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];
    for (const item of items) {
      result.push({
        ...item,
        children: [], // Remove children for flat list
      });
      if (item.children.length > 0) {
        result.push(...flatten(item.children));
      }
    }
    return result;
  }

  return flatten(tree);
}
