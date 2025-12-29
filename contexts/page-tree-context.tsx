"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { Page } from "@/db/schema";
import { PageTreeNode } from "@/components/admin/sortable-tree";

type PageTreeContextType = {
  pagesTree: PageTreeNode[];
  setPagesTree: (tree: PageTreeNode[]) => void;
  refreshPagesTree: () => Promise<void>;
  isRefreshing: boolean;
  updatePageInTree: (page: Page) => void;
  removePageFromTree: (pageId: number) => void;
};

const PageTreeContext = createContext<PageTreeContextType | undefined>(undefined);

export function PageTreeProvider({ children, initialTree }: { children: ReactNode; initialTree: PageTreeNode[] }) {
  const [pagesTree, setPagesTree] = useState<PageTreeNode[]>(initialTree);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update initial tree when it changes from server
  useEffect(() => {
    setPagesTree(initialTree);
  }, [initialTree]);

  const refreshPagesTree = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('/api/admin/pages/tree');
      if (!response.ok) throw new Error('Failed to refresh pages tree');
      const newTree = await response.json();
      setPagesTree(newTree);
    } catch (error) {
      console.error('Failed to refresh pages tree:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const updatePageInTree = useCallback((page: Page) => {
    setPagesTree((prevTree) => {
      const updateNode = (nodes: PageTreeNode[]): PageTreeNode[] => {
        return nodes.map((node) => {
          if (node.id === String(page.id)) {
            return {
              ...node,
              title: page.title,
              slug: page.slug,
              isDraft: page.isDraft,
              showOnMenu: page.showOnMenu,
              // Preserve translations if they exist
              ...(node.translations && { translations: node.translations }),
            };
          }
          if (node.children) {
            return {
              ...node,
              children: updateNode(node.children),
            };
          }
          return node;
        });
      };
      return updateNode(prevTree);
    });
  }, []);

  const removePageFromTree = useCallback((pageId: number) => {
    setPagesTree((prevTree) => {
      const removeNode = (nodes: PageTreeNode[]): PageTreeNode[] => {
        return nodes
          .filter((node) => node.id !== String(pageId))
          .map((node) => ({
            ...node,
            children: node.children ? removeNode(node.children) : undefined,
          }));
      };
      return removeNode(prevTree);
    });
  }, []);

  return (
    <PageTreeContext.Provider
      value={{
        pagesTree,
        setPagesTree,
        refreshPagesTree,
        isRefreshing,
        updatePageInTree,
        removePageFromTree,
      }}
    >
      {children}
    </PageTreeContext.Provider>
  );
}

export function usePageTree() {
  const context = useContext(PageTreeContext);
  if (!context) {
    throw new Error("usePageTree must be used within PageTreeProvider");
  }
  return context;
}
