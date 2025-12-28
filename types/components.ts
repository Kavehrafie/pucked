/**
 * Component Types
 *
 * Shared types for React components across the application.
 */

import type { HTMLAttributes, ReactNode } from "react";
import type { PageTranslationStatus } from "./database";

/**
 * Props for admin sidebar right panel
 */
export interface AdminSidebarRightProps {
  children: React.ReactNode;
  title?: string;
}

/**
 * Props for image block component
 */
export interface ImageBlockProps {
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * Props for TreeItem component
 */
export interface TreeItemProps extends Omit<HTMLAttributes<HTMLLIElement>, 'id'> {
  childCount?: number;
  clone?: boolean;
  collapsed?: boolean;
  depth: number;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  value: string;
  translations?: PageTranslationStatus[];
  pageSlug?: string;
  pageId?: string;
  isSelected?: boolean;
  onCollapse?(): void;
  onRemove?(): void;
  onClick?(): void;
}

/**
 * Props for sortable tree component
 */
export interface SortableTreeProps {
  items: import("./database").PageTreeNode[];
  onChange?: (items: import("./database").PageTreeNode[]) => void;
  collapsible?: boolean;
  removable?: boolean;
  indentationWidth?: number;
}


export type HeaderActionBase = {
label: string;
  icon?: ReactNode;
};
export type HeaderActionButton = HeaderActionBase & {
  onClick: () => void;
  variant?: "primary" | "secondary";
};
export type HeaderActionLink = HeaderActionBase & {
  label: string;
  href: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
};
export type HeaderActionDropdown = HeaderActionBase & {
  options: Array<HeaderActionButton | HeaderActionLink>;
};
export type HeaderAction = HeaderActionButton | HeaderActionLink | HeaderActionDropdown;
export type AdminLayoutState = {
  sidebarLeftVisible: boolean;
  setSidebarLeftVisible: (visible: boolean) => void;
  toggleSidebarLeft: () => void;
  sidebarRightVisible: boolean;
  setSidebarRightVisible: (visible: boolean) => void;
  toggleSidebarRight: () => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
  toggleLoading?: () => void;

  actions: HeaderAction[];
  setActions: (actions: HeaderAction[]) => void;
};

