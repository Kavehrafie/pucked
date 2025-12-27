import { requireAuth } from "@/lib/route-guard";
import { DashboardContent } from "./dashboard-content";
import { AdminLayoutProvider } from "./admin-layout-context";
import { PageSelectionProvider } from "@/components/admin/page-selection-context";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth({ requireInvitation: true });

  return (
    <AdminLayoutProvider>
      <PageSelectionProvider>
        <DashboardContent>{children}</DashboardContent>
      </PageSelectionProvider>
    </AdminLayoutProvider>
  );
}