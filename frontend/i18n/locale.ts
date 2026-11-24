import { DJANGO_LOCALE_COOKIE, LOCALE_COOKIE, isLocale } from "./config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist the locale for next-intl and for Django on the next request. */
export function writeLocaleCookies(locale: string) {
  if (typeof document === "undefined" || !isLocale(locale)) return;
  const common = `path=/; max-age=${ONE_YEAR}; samesite=lax`;
  document.cookie = `${LOCALE_COOKIE}=${locale}; ${common}`;
  document.cookie = `${DJANGO_LOCALE_COOKIE}=${locale}; ${common}`;
}
