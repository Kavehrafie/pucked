"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { Page, PageWithTranslations } from "@/types";

type PageSelectionState = {
  selectedPage: PageWithTranslations | null;
  setSelectedPage: (page: PageWithTranslations | null | ((prev: PageWithTranslations | null) => PageWithTranslations | null)) => void;
  clearSelection: () => void;
};

const PageSelectionContext = createContext<PageSelectionState | undefined>(
  undefined
);

export function PageSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedPage, setSelectedPage] = useState<Page | null>(null);

  const clearSelection = () => {
    setSelectedPage(null);
  };

  return (
    <PageSelectionContext.Provider
      value={{ selectedPage, setSelectedPage, clearSelection }}
    >
      {children}
    </PageSelectionContext.Provider>
  );
}

export function usePageSelection() {
  const context = useContext(PageSelectionContext);
  if (!context) {
    throw new Error("usePageSelection must be used within PageSelectionProvider");
  }
  return context;
}
