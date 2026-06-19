# Settings Status

This page documents the current status of configurable settings across the StudioSync platform.

## Studio Settings

These settings are managed by the Studio Administrator and control studio-wide behavior.

| Setting             | Status     | Description                      |
| ------------------- | ---------- | -------------------------------- |
| Studio Name         | ✅ Active  | Display name for the studio      |
| Timezone            | ✅ Active  | Default timezone for scheduling  |
| Currency            | ✅ Active  | Currency used for billing        |
| Logo                | ✅ Active  | Studio logo displayed in the app |
| Stripe Integration  | ✅ Active  | Payment processing via Stripe    |
| Email Notifications | ✅ Active  | Outbound email for reminders     |
| SMS Notifications   | 🔜 Planned | SMS reminders via Twilio         |

## User Settings

Individual user preferences that override studio defaults.

| Setting                  | Status     | Description                            |
| ------------------------ | ---------- | -------------------------------------- |
| Theme (Dark/Light)       | ✅ Active  | Per-user color scheme preference       |
| Notification Preferences | ✅ Active  | Email and in-app notification toggles  |
| Calendar View            | ✅ Active  | Default calendar view (day/week/month) |
| Language                 | 🔜 Planned | Interface localization                 |

## Feature Flags

| Feature               | Status     | Notes                                 |
| --------------------- | ---------- | ------------------------------------- |
| Inventory Management  | ✅ Active  | Track instruments and equipment       |
| Resource Library      | ✅ Active  | Lesson plans and materials            |
| Group Lessons         | ✅ Active  | Band and ensemble scheduling          |
| Parent Portals        | ✅ Active  | Family account management             |
| Studio Builder        | 🔜 Planned | Visual room and schedule builder      |
| AI Lesson Suggestions | 🔜 Planned | AI-powered curriculum recommendations |

## Configuration Notes

!!! info "Changing Settings"
Most settings take effect immediately. Stripe and email integration changes may require a server restart in self-hosted environments.

!!! warning "Multi-Tenancy"
Each studio operates in isolation. Settings configured for one studio do not affect others.
