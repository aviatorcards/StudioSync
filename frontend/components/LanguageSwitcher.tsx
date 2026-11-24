"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { useUser } from "@/contexts/UserContext";
import { locales, type AppLocale } from "@/i18n/config";
import { writeLocaleCookies } from "@/i18n/locale";
import api from "@/services/api";

/**
 * Cookie-based language switcher. Signed-in users also persist `language`
 * on their account so emails and notifications follow the same choice.
 */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const t = useTranslations("Settings");
  const languageNames = useTranslations("Languages");
  const router = useRouter();
  const { currentUser, setCurrentUser } = useUser();
  const [saving, setSaving] = useState(false);

  const onChange = async (next: string) => {
    if (next === locale || !locales.includes(next as AppLocale)) return;
    writeLocaleCookies(next);
    if (currentUser) {
      setSaving(true);
      try {
        const res = await api.patch("/core/users/me/", { language: next });
        setCurrentUser({ ...currentUser, ...res.data, language: next });
        toast.success(t("languageSaved"));
      } catch {
        toast.error(t("languageSaveFailed"));
      } finally {
        setSaving(false);
      }
    }
    router.refresh();
  };

  return (
    <label className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <span className="sr-only">{t("language")}</span>
      <select
        aria-label={t("language")}
        value={locale}
        disabled={saving}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border bg-transparent px-2 py-1 text-sm"
        style={{ borderColor: "rgba(193,124,46,0.35)", color: "inherit" }}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {languageNames(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
