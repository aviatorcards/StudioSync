# Adding a language

StudioSync keeps English as the default. The interface language is a cookie (`NEXT_LOCALE`), not a `/de/...` URL prefix, because the app already has a `[studio]` route and a large set of paths. Django reads the matching `django_language` cookie (and `Accept-Language`) for emails and API messages. A signed-in user can also save a language on their account; that choice wins on the next visit and is what emails and in-app notifications use.

German (`de`) is registered so a translation can be filled in. `frontend/messages/de.json` and `backend/locale/de/LC_MESSAGES/django.po` are stubs: a few strings are translated and marked, and the rest is still English or empty. Do not treat them as a finished German translation.

## Frontend (next-intl)

Message files live in `frontend/messages/<locale>.json`. `frontend/messages/en.json` is the source catalog. Locales are listed in `frontend/i18n/config.ts`.

1. Copy `frontend/messages/en.json` to `frontend/messages/<locale>.json` and translate the values. Keep the keys, and keep `{name}` / `{count, plural, ...}` placeholders intact.
2. Add the locale code to `locales` in `frontend/i18n/config.ts`.
3. Add a matching entry to the `catalogs` map in `frontend/i18n/request.ts`.
4. Add the same code to `LANGUAGES` in `backend/config/settings.py` and to the `language` choices on `User` (model, migration, and serializer). The settings language switcher lists whatever `locales` contains.
5. From `frontend/`, run `npm test` (checks that the new catalog still has every English key) and open the app. The language menu is in the public navigation, the login and setup screens, and **Settings**.

Dates, times, and money on the screens this change touched use `useFormatter()` / `Intl` with the active locale. Pass `timeZone` from the user when you format a real timestamp; the default is UTC.

## Backend (gettext)

User-facing email and notification strings are wrapped with `gettext` (`_()`) or `{% trans %}` / `{% blocktrans %}` in `backend/templates/emails/`. Catalogs live in `backend/locale/<locale>/LC_MESSAGES/django.po`.

```bash
cd backend
django-admin makemessages -l de --ignore=venv
# edit locale/de/LC_MESSAGES/django.po
django-admin compilemessages
```

`compilemessages` writes the `.mo` files Django actually loads. Commit both `.po` and `.mo`.

A saved `User.language` is activated for that recipient before an email or notification is rendered. Notifications store the translated text, so older rows stay in the language they were created in. An empty `language` means "no preference" and falls back to English for mail sent outside a request.

## What is extracted

Wired to the catalogs:

- Public navigation and footer
- Login, forgot-password, and reset-password
- Setup wizard chrome, feature step, and the unused welcome step (the live wizard still starts on studio and admin)
- Dashboard shell (sidebar and header), dashboard home, student roster, and student profile
- Settings hub, including the language selector
- Shared loading and error screens
- Common auth validation and error strings
- Account, welcome, approval, lesson, and new-message emails, plus in-app notification titles

## What is left

Still hardcoded in English:

- Marketing pages (home, pricing, about, privacy, terms, support) beyond the nav and footer
- Signup, and the setup steps that collect the studio and admin account (`StudioAdminStep`, `CompletionStep`) — left alone because [security PR #9](https://github.com/aviatorcards/StudioSync/pull/9) is already editing them
- Most dashboard modules: schedule, lessons, billing, gigs, bands, messages, resources, inventory, reports, users, studio builder, and the general settings form
- Invoice and other generated documents
- Stream Chat's own UI
- The MkDocs site under `frontend/public/docs`
- Phone-number formatting, which is still US-shaped
- The upcoming-lesson card on a student profile, which is still placeholder copy (the birthday and "member since" dates are locale-formatted)

There is no separate parent area. Parents share the shell; most sidebar items are still hidden from that role, which was already the case.

## Deploy

Run migrations. This adds `users.language` (`0020_user_language`). No new environment variables.

If you merge this alongside PR #9, give the two `0020_*` migrations a merge migration (they both extend `0019` and touch different fields). Recompile messages after resolving gettext conflicts in `backend/apps/auth/views.py`.
