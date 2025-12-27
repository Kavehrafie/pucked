"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AdminLayoutState = {
  sidebarLeftVisible: boolean;
  setSidebarLeftVisible: (visible: boolean) => void;
  toggleSidebarLeft: () => void;
  sidebarRightVisible: boolean;
  setSidebarRightVisible: (visible: boolean) => void;
  toggleSidebarRight: () => void;
};

const AdminLayoutContext = createContext<AdminLayoutState | undefined>(
  undefined
);

export function AdminLayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarLeftVisible, setSidebarLeftVisible] = useState(true);
  const [sidebarRightVisible, setSidebarRightVisible] = useState(true);
  
  const toggleSidebarLeft = () => {
    setSidebarLeftVisible((prev) => !prev);
  };

  const toggleSidebarRight = () => {
    setSidebarRightVisible((prev) => !prev);
  };

  return (
    <AdminLayoutContext.Provider
      value={{ sidebarLeftVisible, setSidebarLeftVisible, toggleSidebarLeft, sidebarRightVisible, setSidebarRightVisible, toggleSidebarRight }}
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
