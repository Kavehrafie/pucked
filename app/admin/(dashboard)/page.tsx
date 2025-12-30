import { requireAuth } from "@/lib/route-guard";
import { PagesTree } from "./pages-tree";
import { Button } from "@/components/admin/ui/button";
import Link from "next/link";
import { FormSection, HeadingSection } from "@/components/admin/form-layout";

export default async function DashboardPage() {
  await requireAuth();

  return (
    <div className="p-6 space-y-6 @container">
      <FormSection
        heading={
          <HeadingSection
            title="Pages Management"
            description="Actions related to site pages">
          </HeadingSection>
        }
      >
        <div className="flex justify-end">

          <Button asChild variant="primary">
            <Link href="/admin/pages/create">Create Page</Link>
          </Button>
        </div>
      </FormSection>
      <FormSection heading={
          <HeadingSection
            title="Page Tree"
            description="Manage your site pages and content structure">
          </HeadingSection>
      }>
        <PagesTree />
      </FormSection>
    </div>
  );
}


