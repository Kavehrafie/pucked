"use client";

import type { HeaderAction, AdminLayoutState, HeaderActionLink, HeaderActionButton } from "@/types/components";
import { createContext, useContext, useState, ReactNode } from "react";

export function isButtonAction(action: HeaderAction): action is HeaderActionButton {
  return typeof action === "object" && action !== null && "onClick" in action;
}

export function isLinkAction(action: HeaderAction): action is HeaderActionLink {
  return typeof action === "object" && action !== null && "href" in action;
}

const AdminLayoutContext = createContext<AdminLayoutState | undefined>(
  undefined
);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarLeftVisible, setSidebarLeftVisible] = useState(true);
  const [sidebarRightVisible, setSidebarRightVisible] = useState(true);
  const [actions, setActions] = useState<HeaderAction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const toggleSidebarLeft = () => {
    setSidebarLeftVisible((prev) => !prev);
  };

  const toggleSidebarRight = () => {
    setSidebarRightVisible((prev) => !prev);
  };

  const toggleLoading = () => {
    setIsLoading((prev) => !prev);
  }

  return (
    <AdminLayoutContext.Provider
      value={{ sidebarLeftVisible, setSidebarLeftVisible, toggleSidebarLeft, sidebarRightVisible, setSidebarRightVisible, toggleSidebarRight, isLoading, setIsLoading, toggleLoading, actions, setActions }}
    >
      {children}
    </AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const context = useContext(AdminLayoutContext);
  if (!context) {
    throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  }
  return context;
}
