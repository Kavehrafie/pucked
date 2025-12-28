import { getDb } from "@/db";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { SiteSettingValue, SiteSettings } from "@/types/site-settings";

// Re-export types for convenience
export type { SiteSettingValue, SiteSettings };

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
  value: SiteSettingValue,
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

  // Clone default settings to start with
  const result: SiteSettings = { ...DEFAULT_SETTINGS };

  for (const setting of settings) {
    const keys = setting.key.split(".");
    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = setting.value;
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
    // Skip undefined values entirely
    if (value === undefined) {
      continue;
    }

    // For objects, filter out undefined/empty properties and skip if empty
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      // Filter out undefined and empty string properties
      const filtered = Object.fromEntries(
        Object.entries(value).filter(
          ([, v]) => v !== undefined && v !== ""
        )
      );

      // Only save if there are actual properties with values
      if (Object.keys(filtered).length > 0) {
        await setSiteSetting(key, filtered, "general");
      }
    } else {
      // For non-objects (strings, arrays), save as-is
      await setSiteSetting(key, value, "general");
    }
  }
}

/**
 * Initialize default site settings if they don't exist
 */
export async function initializeDefaultSiteSettings(): Promise<void> {
  const db = getDb();
  const existing = await db.select().from(siteSettings).limit(1);

  // Only initialize if no settings exist at all
  if (existing.length === 0) {
    await updateSiteSettings(DEFAULT_SETTINGS);
  }
}
