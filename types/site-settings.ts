/**
 * Site Settings Types
 *
 * This file contains all type definitions for the site settings system.
 * Both the database schema and the settings library import from here to avoid
 * circular dependencies.
 */

/**
 * Union type of all possible site setting values
 * Each setting key has a specific value type
 */
export type SiteSettingValue =
  | { en: string; fa: string }  // siteName
  | string                       // logoUrl
  | {                           // socialLinks
      twitter?: string;
      facebook?: string;
      instagram?: string;
      linkedin?: string;
      youtube?: string;
    }
  | {                           // footerQuickLinks
      en: Array<{ label: string; url: string }>;
      fa: Array<{ label: string; url: string }>;
    };

/**
 * Complete site settings object structure
 * This represents the full settings configuration
 */
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

/**
 * Known site setting keys for type-safe lookups
 */
export type SiteSettingKey = keyof SiteSettings;
