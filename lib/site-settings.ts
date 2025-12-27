import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export type SiteSettingValue = string;

export interface SiteSettings {
  siteName: {
    en: string;
    fa: string;
  };
  logoUrl?: string;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  footerQuickLinks?: {
    en: Array<{ label: string; url: string }>;
    fa: Array<{ label: string; url: string }>;
  };
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: {
    en: "Pucked",
    fa: "پاکد",
  },
  logoUrl: "",
  socialLinks: {},
  footerQuickLinks: {
    en: [],
    fa: [],
  },
};

/**
 * Get a single site setting value by key
 */
export async function getSiteSetting(key: string): Promise<SiteSettingValue | null> {
  const db = getDb();
  const setting = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.key, key))
    .limit(1);

  return setting[0]?.value || null;
}

/**
 * Set a single site setting value
 */
export async function setSiteSetting(
  key: string,
  value: string,
  category: string = "general"
): Promise<void> {
  const db = getDb();
  await db
    .insert(siteSettings)
    .values({
      key,
      value,
      category,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: siteSettings.key,
      set: {
        value,
        category,
        updatedAt: new Date(),
      },
    });
}

/**
 * Get all site settings as a typed object
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const db = getDb();
  const settings = await db.select().from(siteSettings);

  const result: SiteSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

  for (const setting of settings) {
    const keys = setting.key.split(".");
    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    try {
      current[keys[keys.length - 1]] = JSON.parse(setting.value);
    } catch {
      current[keys[keys.length - 1]] = setting.value;
    }
  }

  return result;
}

/**
 * Update site settings (partial update)
 */
export async function updateSiteSettings(
  updates: Partial<SiteSettings>
): Promise<void> {
  for (const [key, value] of Object.entries(updates)) {
    await setSiteSetting(key, JSON.stringify(value), "general");
  }
}

/**
 * Initialize default site settings if they don't exist
 */
export async function initializeDefaultSiteSettings(): Promise<void> {
  const existing = await getSiteSettings();

  if (!existing.siteName || existing.siteName.en === DEFAULT_SETTINGS.siteName.en) {
    await updateSiteSettings(DEFAULT_SETTINGS);
  }
}
