"use client";

import { cn } from "@/lib/utils";
import { useAdminLayout } from "@/app/admin/(dashboard)/admin-layout-context";
import { X } from "lucide-react";
import { IconButton } from "@measured/puck";

export interface AdminSidebarRightProps {
  children: React.ReactNode;
  title?: string;
}

export function AdminSidebarRight({ children, title = "Properties" }: AdminSidebarRightProps) {
  const { sidebarRightVisible } = useAdminLayout();

  return (
    <>
      {/* Sidebar right */}
      <aside
        data-sidebar-right
        data-sidebar-right-visible={sidebarRightVisible}
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
          background: "var(--puck-color-white)",
          borderInlineStart: "1px solid var(--puck-color-grey-09)",
          transition: "width 150ms ease-in",
          width: sidebarRightVisible ? "320px" : "0",
          flexShrink: 0,
          overflow: sidebarRightVisible ? "auto" : "hidden"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Header */}
          {title && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--puck-space-px)",
                borderBottom: "1px solid var(--puck-color-grey-09)",
                fontSize: "var(--puck-font-size-s)",
                fontWeight: 600,
                color: "var(--puck-color-black)"
              }}
            >
              <span>{title}</span>
            </div>
          )}

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "var(--puck-space-px)" }}>
            {children}
          </div>
        </div>
      </aside>
    </>
  );
}
