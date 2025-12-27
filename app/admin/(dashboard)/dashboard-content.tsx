"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar-left";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebarRight } from "@/components/admin/admin-sidebar-right";
import { PagePropertiesForm } from "@/components/admin/page-properties-form";
import { SidebarTranslations } from "@/components/admin/sidebar-translations";
import { usePageSelection } from "@/components/admin/page-selection-context";
import styles from "./admin-dashboard.module.css";
import { ReactNode } from "react";

export function DashboardContent({ children }: { children: ReactNode }) {
  const { selectedPage } = usePageSelection();

  return (
    <div className={styles.adminDashboard}>
      <div className={styles.adminDashboardContainer}>
        <AdminHeader />
        <div className={styles.adminDashboardContent}>
          <AdminSidebar />
          <main className={styles.adminDashboardMain}>
            {children}
          </main>
          <AdminSidebarRight title={selectedPage ? "Page Properties" : "Properties"}>
            {selectedPage ? (
              <div className="space-y-6">
                <SidebarTranslations translations={selectedPage.translations} />
                <PagePropertiesForm key={selectedPage.id} page={selectedPage} />
              </div>
            ) : (
              <div style={{ textAlign: "center", color: "var(--puck-color-grey-05)", padding: "var(--puck-space-px)" }}>
                <p style={{ fontSize: "var(--puck-font-size-xxs)" }}>Select a page to view properties</p>
              </div>
            )}
          </AdminSidebarRight>
        </div>
      </div>
    </div>
  );
}
