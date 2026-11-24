"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";

import { useUser } from "@/contexts/UserContext";
import { isLocale } from "@/i18n/config";
import { writeLocaleCookies } from "@/i18n/locale";
import api from "@/services/api";

/**
 * After sign-in, a saved language preference wins over the browser cookie.
 * An empty preference leaves the cookie (and the logged-out choice) alone.
 */
export function LocaleSync() {
  const locale = useLocale();
  const router = useRouter();
  const { currentUser } = useUser();
  const applied = useRef<string | null>(null);

  useEffect(() => {
    api.defaults.headers.common["Accept-Language"] = locale;
    const preferred = currentUser?.language;
    if (!preferred || !isLocale(preferred) || preferred === locale) return;
    if (applied.current === preferred) return;
    applied.current = preferred;
    writeLocaleCookies(preferred);
    router.refresh();
  }, [locale, currentUser?.language, router]);

  return null;
}
