# 317booking Integration

StudioSync can connect to a [317booking](https://github.com/tristansmith/317booking) instance — a dedicated gig marketplace with venue management, pay tiers, and Stripe payouts. When the integration is enabled, bands managed in StudioSync automatically get 317booking accounts, and external gig bookings block band availability in StudioSync in real time.

## Architecture overview

```
┌─────────────────────────┐          ┌──────────────────────────┐
│        StudioSync        │          │        317booking         │
│                          │          │                           │
│  Band created/updated ──────────►  POST /api/webhooks/         │
│                          │  band.*  │       studiosync          │
│  ◄─── icalUrl ────────────────────  creates Band account       │
│  stores on Band.         │          │                           │
│  ical_feed_url           │          │                           │
│                          │          │                           │
│  sync_band_calendar ◄───────────── GET /api/bands/{id}/        │
│  (background task)       │  iCal    │       calendar.ics        │
│  → BandExternalEvent     │          │                           │
│                          │          │                           │
│  POST /api/gigs/         │          │                           │
│  webhooks/317booking/ ◄──────────── gig.confirmed /            │
│  → BandExternalEvent     │  gig.*   │       gig.cancelled       │
│    (immediate block)     │          │                           │
└─────────────────────────┘          └──────────────────────────┘
```

### Flow 1 — Band registration

1. A studio admin creates a Band in StudioSync.
2. A `post_save` signal fires `band.created` to 317booking (`POST /api/webhooks/studiosync`).
3. 317booking creates a linked user + band account and returns `{ bandId, icalUrl }`.
4. StudioSync stores the `icalUrl` on `Band.ical_feed_url`.
5. The background task `sync_band_calendar` polls the iCal feed and imports confirmed gigs as `BandExternalEvent` records.

On subsequent saves, a `band.updated` event keeps the name and genre in sync.

### Flow 2 — Real-time gig blocking

1. A venue posts a gig in 317booking and a band claims it.
2. Once confirmed (auto-assign or venue review), 317booking fires `gig.confirmed` to `POST /api/gigs/webhooks/317booking/`.
3. StudioSync upserts a `BandExternalEvent` for that band and date immediately — no waiting for the iCal poll.
4. If the gig is later cancelled, `gig.cancelled` deletes the event and frees the date.

---

## Configuration

Add these variables to StudioSync's `.env`:

```bash
# Base URL of the 317booking instance — no trailing slash
BOOKING_317_URL=https://317booking.example.com

# Shared HMAC secret — must match STUDIOSYNC_WEBHOOK_SECRET in 317booking's .env
# Generate with: openssl rand -hex 32
BOOKING_317_WEBHOOK_SECRET=your-secret-here
```

And in 317booking's `.env.local`:

```bash
STUDIOSYNC_URL=https://studiosync.example.com
STUDIOSYNC_WEBHOOK_SECRET=your-secret-here   # same value as above
```

Leave `BOOKING_317_URL` empty to disable the integration entirely.

---

## Endpoints

### Outbound: `POST {BOOKING_317_URL}/api/webhooks/studiosync`

Fired automatically by a Django `post_save` signal on `Band`.

**Headers**

```
Content-Type: application/json
x-studiosync-signature: sha256=<hmac-hex>
```

**Payloads**

=== "band.created"

    ```json
    {
      "event": "band.created",
      "band": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "The Midnight",
        "genre": "Synth-pop",
        "billing_email": "band@example.com"
      }
    }
    ```

=== "band.updated"

    ```json
    {
      "event": "band.updated",
      "band": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "The Midnight",
        "genre": "Synth-pop",
        "billing_email": "band@example.com"
      }
    }
    ```

**`band.created` success response (201)**

```json
{
  "ok": true,
  "bandId": "clx...",
  "icalUrl": "https://317booking.example.com/api/bands/clx.../calendar.ics",
  "message": "Band registered. Send the band a password reset link so they can log in."
}
```

StudioSync saves `icalUrl` to `Band.ical_feed_url` automatically.

---

### Inbound: `POST /api/gigs/webhooks/317booking/`

Receives gig lifecycle events from 317booking.

**Headers**

```
Content-Type: application/json
x-317booking-signature: sha256=<hmac-hex>
```

**Supported events**

| Event | Effect |
|---|---|
| `gig.confirmed` | Upserts a `BandExternalEvent` blocking the gig date for the band |
| `gig.cancelled` | Deletes the `BandExternalEvent`, freeing the date |

**`gig.confirmed` payload**

```json
{
  "event": "gig.confirmed",
  "gig": {
    "id": "clx...",
    "date": "2026-08-15T00:00:00.000Z",
    "studiosync_band_id": "550e8400-e29b-41d4-a716-446655440000",
    "venue_name": "The Ryman Auditorium",
    "venue_address": "116 5th Ave N, Nashville, TN 37219",
    "description": "Opening set, doors at 7pm"
  }
}
```

**`gig.cancelled` payload**

```json
{
  "event": "gig.cancelled",
  "gig": {
    "id": "clx..."
  }
}
```

**Responses**

| Status | Meaning |
|---|---|
| `200` | Event processed (or safely ignored). |
| `401` | Invalid or missing signature. |
| `404` | `studiosync_band_id` not found in this StudioSync instance. |
| `400` | Malformed date. |

---

## Signature verification

Signatures are computed as HMAC-SHA256 over the raw request body:

```python
import hmac, hashlib

sig = "sha256=" + hmac.new(
    secret.encode("utf-8"),
    raw_body,           # bytes
    hashlib.sha256,
).hexdigest()
```

StudioSync signs outbound requests with `x-studiosync-signature` and verifies inbound requests using the same `BOOKING_317_WEBHOOK_SECRET`. If the secret is not configured, verification is skipped — convenient for local development, but always set a secret in production.

---

## Background calendar sync

StudioSync's `sync_band_calendar` task polls `Band.ical_feed_url` (set automatically on `band.created`) and upserts `BandExternalEvent` records. This provides:

- Bulk backfill when a band first connects
- Recovery if a real-time webhook is missed
- Removal of past events that dropped off the feed

Run it manually:

```bash
docker compose exec backend python manage.py shell -c \
  "from apps.gigs.tasks import sync_all_band_calendars; sync_all_band_calendars()"
```

Schedule it via Django Q or cron to run every few hours.

---

## Troubleshooting

**`band.created` webhook never fires**

- `BOOKING_317_URL` must be set and non-empty; an empty string disables the integration.
- Check Django logs for `317booking webhook` error lines.
- Confirm the StudioSync server can reach the 317booking host on the configured port.

**`ical_feed_url` not being set on the band**

- The webhook must return a `201` with `icalUrl` in the JSON body.
- Check that `NEXTAUTH_URL` is set correctly in 317booking (it's used to build the absolute URL).

**Gig dates not blocked after confirmation**

- Verify `STUDIOSYNC_URL` and `STUDIOSYNC_WEBHOOK_SECRET` are set in 317booking.
- Confirm the band was created via the StudioSync webhook — bands registered directly in 317booking have no `studiosyncId` and won't receive gig notifications.
- Check StudioSync's `BandExternalEvent` table for UIDs matching `gig-*@317booking`.

**409 on `band.created`**

A user with that billing email already exists in 317booking. Have the band log in to 317booking and ask them to contact support to link the accounts manually. There is no automatic merge to prevent accidental account takeover.
