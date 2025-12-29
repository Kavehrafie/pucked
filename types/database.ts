/**
 * Database Types
 *
 * Types related to database entities and operations.
 * These types are inferred from the Drizzle schema but can be
 * enhanced with additional domain-specific types.
 */

import type { User, Session, Invitation, Page, PageTranslation, SiteSetting } from "@/db/schema";

// Re-export Drizzle-inferred types for convenience
export type { User, Session, Invitation, Page, PageTranslation, SiteSetting };

/**
 * Extended Page type with translations attached
 * Used in contexts where page data includes related translations
 */
export type PageWithTranslations = Page & {
  translations?: PageTranslation[];
};

/**
 * Page translation status for UI display
 */
export interface PageTranslationStatus {
  locale: string;
  published: boolean;
  hasContent: boolean;
}

/**
 * Page tree node for hierarchical page structures
 */
export interface PageTreeNode {
  id: string;
  title: string;
  slug: string;
  isDraft: boolean;
  showOnMenu: boolean;
  translations?: PageTranslationStatus[];
  children?: PageTreeNode[];
  collapsed?: boolean;
}
