/**
 * Locales shipped with the app. English is the default and the source catalog.
 * German is registered so a contributor can fill messages/de.json; see TRANSLATING.md.
 */
export const locales = ["en", "de"] as const;

export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

/** Read by next-intl on the server. Not a URL prefix. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Read by Django's LocaleMiddleware. */
export const DJANGO_LOCALE_COOKIE = "django_language";

export function isLocale(value: string | null | undefined): value is AppLocale {
  return !!value && (locales as readonly string[]).includes(value);
}
