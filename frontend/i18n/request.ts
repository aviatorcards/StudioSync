import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

import { defaultLocale, isLocale, LOCALE_COOKIE, type AppLocale } from "./config";

const catalogs: Record<AppLocale, () => Promise<{ default: Record<string, unknown> }>> = {
  en: () => import("../messages/en.json"),
  de: () => import("../messages/de.json"),
};

export default getRequestConfig(async () => {
  const store = await cookies();
  const requested = store.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(requested) ? requested : defaultLocale;

  return {
    locale,
    messages: (await catalogs[locale]()).default,
    // Stable default. Call sites that know the user pass their timezone explicitly.
    timeZone: "UTC",
  };
});
