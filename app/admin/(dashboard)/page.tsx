import { requireAuth } from "@/lib/route-guard";
import { PagesTree } from "./pages-tree";

export default async function DashboardPage() {
  await requireAuth({ requireInvitation: true });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Pages</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your site pages and content structure</p>
      </div>
      <PagesTree />
    </div>
  );
}