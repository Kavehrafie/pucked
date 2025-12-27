import { requireAuth } from "@/lib/route-guard";
import { SettingsForm } from "./settings-form";
import { getSiteSettings } from "@/lib/site-settings";

export default async function SettingsPage() {
  await requireAuth({ requireInvitation: true });
  const settings = await getSiteSettings();

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Site Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your site configuration and branding</p>
      </div>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
