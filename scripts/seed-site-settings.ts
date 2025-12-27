import { db } from "../db";
import { siteSettings } from "../db/schema";
import { eq } from "drizzle-orm";

async function seedSiteSettings() {
  console.log("🌱 Seeding site settings...");

  const defaultSettings = [
    {
      key: "siteName",
      value: JSON.stringify({
        en: "Pucked",
        fa: "پاکد",
      }),
      category: "general",
    },
    {
      key: "logoUrl",
      value: JSON.stringify(""),
      category: "general",
    },
    {
      key: "socialLinks",
      value: JSON.stringify({
        twitter: "https://twitter.com",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        linkedin: "https://linkedin.com",
        youtube: "https://youtube.com",
      }),
      category: "social",
    },
    {
      key: "footerQuickLinks",
      value: JSON.stringify({
        en: [
          { label: "Home", url: "/en" },
          { label: "About", url: "/en/about" },
          { label: "Contact", url: "/en/contact" },
        ],
        fa: [
          { label: "خانه", url: "/fa" },
          { label: "درباره ما", url: "/fa/about" },
          { label: "تماس", url: "/fa/contact" },
        ],
      }),
      category: "footer",
    },
  ];

  for (const setting of defaultSettings) {
    try {
      // Check if setting already exists
      const existing = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.key, setting.key))
        .get();

      if (existing) {
        console.log(`✅ Setting "${setting.key}" already exists, skipping...`);
      } else {
        // Insert new setting
        await db.insert(siteSettings).values(setting);
        console.log(`✅ Created setting: ${setting.key}`);
      }
    } catch (error) {
      console.error(`❌ Error creating setting "${setting.key}":`, error);
    }
  }

  console.log("✨ Site settings seeding complete!");
  process.exit(0);
}

seedSiteSettings().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
