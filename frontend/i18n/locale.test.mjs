import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createTranslator } from "next-intl";

const en = JSON.parse(readFileSync(new URL("../messages/en.json", import.meta.url), "utf8"));
const de = JSON.parse(readFileSync(new URL("../messages/de.json", import.meta.url), "utf8"));

function leafKeys(value, prefix = "") {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    leafKeys(child, prefix ? `${prefix}.${key}` : key)
  );
}

test("english catalog renders a navigation string", () => {
  const t = createTranslator({ locale: "en", messages: en });
  assert.equal(t("Nav.home"), "Home");
  assert.equal(t("Auth.signIn"), "Sign in");
});

test("german stub renders the wired strings and keeps every english key", () => {
  const t = createTranslator({ locale: "de", messages: de });
  assert.match(de._stub, /STUB/);
  assert.equal(t("Nav.home"), "Startseite");
  assert.equal(t("Auth.signIn"), "Anmelden");
  assert.equal(t("Settings.language"), "Sprache");

  const englishKeys = new Set(leafKeys(en));
  const germanKeys = new Set(leafKeys(de));
  for (const key of englishKeys) {
    assert.ok(germanKeys.has(key), `missing German key ${key}`);
  }
});

test("locale formatters differ between english and german", () => {
  const amount = 1234.5;
  const when = new Date("2026-03-15T15:30:00Z");
  const enMoney = new Intl.NumberFormat("en", { style: "currency", currency: "EUR" }).format(amount);
  const deMoney = new Intl.NumberFormat("de", { style: "currency", currency: "EUR" }).format(amount);
  const enDate = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(when);
  const deDate = new Intl.DateTimeFormat("de", { dateStyle: "medium", timeZone: "UTC" }).format(when);
  assert.notEqual(enMoney, deMoney);
  assert.notEqual(enDate, deDate);
  assert.match(deMoney, /€/);
});
