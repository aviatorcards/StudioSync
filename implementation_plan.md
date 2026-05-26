# Implementation Plan — Backend Bug Fixes & Refactoring

This implementation plan covers the proposed changes to address the following issues in the StudioSync Django backend:
- **Issue 2**: Duplicate `Notification` model with schema mismatch (clean up `messaging.Notification` dead code, fix test imports).
- **Issue 3**: `inventory` app models should use UUID primary keys instead of default integer primary keys (`BigAutoField`).
- **Issue 6**: `CheckoutLog.student` and `RoomReservation.student` should point to `core.Student` instead of `core.User`, with cascading fixes in views, serializers, and Django admin.
- **Issue 7**: `notifications.Notification` model is missing `updated_at` field.
- **Issue 8**: Admin stats queries in `core/views/stats.py` are unscoped and aggregate across all studios instead of filtering to the admin's studio.
- **Issue 10**: Message threads in `messaging/views.py` are not scoped by studio.
- **Issue 11**: Resources app migration chain has a gap (`0008` and `0009` deleted) causing inconsistencies.
- **Issue 12**: Incorrect bare `403` response code format in `core/views/stats.py` when unauthorized.

---

## User Review Required

> [!WARNING]
> **Database Schema Changes in Inventory app:**
> Changing all four inventory models (`InventoryItem`, `CheckoutLog`, `PracticeRoom`, `RoomReservation`) from Django's default `BigAutoField` (Integer) to `UUIDField` is a major schema change. In production PostgreSQL databases, altering integer primary keys to UUIDs requires custom casting or recreating tables, which can be highly disruptive if there is existing production data.
> Since this is currently under active development and orchestrating standard Postgres casting inside Django migrations can be fragile, we will recreate the initial migration of the `inventory` app to use `UUID` PKs from the start. This ensures clean deployments, but if there is existing data in a deployed DB, it must be reset (`docker compose down -v` or manually truncated) to apply the new schema cleanly.

---

## Open Questions

None. The requirements for each of the selected issues are clear and can be safely implemented as outlined below.

---

## Proposed Changes

We will group our proposed changes logically by application/component.

### 1. Messaging Component

#### [MODIFY] [models.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/messaging/models.py)
- Remove `class Notification` model entirely to eliminate the duplicate model.

#### [MODIFY] [serializers.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/messaging/serializers.py)
- Remove `class NotificationSerializer` and the import of `Notification` from `.models`.

#### [MODIFY] [views.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/messaging/views.py)
- Scope message thread listing to the active studio in `MessageThreadViewSet.get_queryset()`.
- Add a helper function `_get_studio_for_user(user)` matching the pattern used in resources views.
- Ensure that users can only query threads that belong to the studio they are currently associated with.

#### [MODIFY] [test_websocket_auth.py](file:///Users/tristan/Documents/code/StudioSync/backend/tests/core/test_websocket_auth.py)
- Fix wrong import statements:
  - Change `from apps.messaging.consumers import NotificationConsumer` to `from apps.notifications.consumers import NotificationConsumer`.
  - Change `from apps.messaging.middleware import TokenAuthMiddleware` to `from apps.core.middleware import TokenAuthMiddleware`.

---

### 2. Notifications Component

#### [MODIFY] [models.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/notifications/models.py)
- Add `updated_at = models.DateTimeField(auto_now=True)` to the `Notification` model to be consistent with all other models in the system.

---

### 3. Inventory Component

#### [MODIFY] [models.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/inventory/models.py)
- Import `uuid` at the top of the file.
- Add `id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)` to all four models: `InventoryItem`, `CheckoutLog`, `PracticeRoom`, `RoomReservation`.
- Update `student` ForeignKey in `CheckoutLog` and `RoomReservation` to point to `"core.Student"` instead of `settings.AUTH_USER_MODEL`.

#### [MODIFY] [serializers.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/inventory/serializers.py)
- Update `CheckoutLogSerializer` and `RoomReservationSerializer` to retrieve the student name via the related `user` model:
  - Change `source="student.get_full_name"` to `source="student.user.get_full_name"`.

#### [MODIFY] [views.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/inventory/views.py)
- Update `CheckoutLogViewSet`:
  - `get_queryset()`: Change `queryset.filter(student=self.request.user)` to `queryset.filter(student__user=self.request.user)`.
  - `perform_create()`: Retrieve the user's student profile when creating a checkout request: change `student=self.request.user` to `student=self.request.user.student_profile`.
- Update `PracticeRoomViewSet`:
  - `availability()`: Change `res.student.get_full_name()` to `res.student.user.get_full_name()`.
- Update `RoomReservationViewSet`:
  - `get_queryset()`: Change `queryset.filter(student=self.request.user)` to `queryset.filter(student__user=self.request.user)`.
  - `perform_create()`: Change `student=self.request.user` to `student=self.request.user.student_profile`.
  - `cancel()`: Change `reservation.student != request.user` to `reservation.student.user != request.user`.

#### [MODIFY] [admin.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/inventory/admin.py)
- Since the student field now refers to `core.Student`, update `search_fields` in `CheckoutLogAdmin` and `RoomReservationAdmin` to look up names on the nested User model:
  - Change `"student__first_name"` to `"student__user__first_name"`.
  - Change `"student__last_name"` to `"student__user__last_name"`.

---

### 4. Core / Stats Component

#### [MODIFY] [stats.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/core/views/stats.py)
- Retrieve the admin's studio in `DashboardStatsView.get()` and filter `Student`, `Lesson`, `Invoice`, and `Teacher` aggregates by `studio=studio`.
- Filter `recent_activity` query for admins to lessons in their studio.
- Retrieve the admin's studio in `DashboardAnalyticsView.get()` and filter analytics aggregations by `studio=studio`.
- In `DashboardAnalyticsView.get()`, change the unauthorized response to return DRF standard format with code `status.HTTP_403_FORBIDDEN` instead of bare `403` integer:
  ```python
  from rest_framework import status
  # ...
  if user.role != "admin":
      return Response({"detail": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
  ```

---

### 5. Resources Component

#### [NEW] [0008_setlist_band_comments.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/resources/migrations/0008_setlist_band_comments.py)
- Recreate `0008` migration as an empty dummy migration to satisfy existing deployed DB schemas.
- It will depend on `"0007_bulk_upload_folders"`.

#### [NEW] [0009_setlist_item_standalone.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/resources/migrations/0009_setlist_item_standalone.py)
- Recreate `0009` migration as an empty dummy migration.
- It will depend on `"0008_setlist_band_comments"`.

#### [MODIFY] [0010_resource_bpm_capo_chord_content.py](file:///Users/tristan/Documents/code/StudioSync/backend/apps/resources/migrations/0010_resource_bpm_capo_chord_content.py)
- Change dependency from `0007_bulk_upload_folders` to `0009_setlist_item_standalone` to make the migration chain complete and chronological without gaps.

---

## Verification Plan

### Automated Tests
- Run backend tests inside the docker container:
  `docker compose exec backend pytest`
- Run the WebSocket auth tests specifically to verify correct imports:
  `docker compose exec backend pytest tests/core/test_websocket_auth.py`
- We will recreate and verify the inventory migrations by running:
  `docker compose exec backend python manage.py makemigrations` and `migrate` (or fully resetting and bootstrapping the database if needed).

### Manual Verification
- Verify that Django admin for inventory checkout logs and practice room reservations is working correctly and allows searching by student first/last name.
- Verify stats API and analytics API via simple HTTP requests.
