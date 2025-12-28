/**
 * Navigation Types
 *
 * Types for navigation menus and routing structures.
 */

/**
 * Menu item structure for navigation
 */
export interface MenuItem {
  id: number;
  title: string;
  slug: string;
  fullPath: string;
  children: MenuItem[];
}

/**
 * Tree item for drag-and-drop navigation
 */
export interface TreeItem {
  id: string;
  children: TreeItem[];
  collapsed?: boolean;
}

/**
 * Flattened tree item for list rendering
 */
export interface FlattenedItem extends TreeItem {
  parentId: string | null;
  depth: number;
  index: number;
}
