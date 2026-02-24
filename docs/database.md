# Database Schema

StudioSync uses PostgreSQL as its relational database. This document outlines the core database models and their relationships.

## Architecture

The database is organized into modular apps, each with its own set of models:

- **core**: Users, studios, teachers, students, families, bands
- **lessons**: Lessons, recurring patterns, lesson notes, goals, lesson plans
- **billing**: Invoices, invoice line items, payments, payment methods
- **inventory**: Inventory items, checkout logs, practice rooms, room reservations
- **resources**: Resources, resource checkouts
- **messaging**: Message threads, messages
- **notifications**: Notifications

## Core Models

### User

The custom user model with email-based authentication.

**Fields:**

- `id` (UUID): Primary key
- `email` (EmailField): Unique, used for login
- `password` (CharField): Hashed password
- `first_name`, `last_name` (CharField): User's name
- `role` (CharField): User role - 'admin', 'teacher', 'student', 'parent'
- `phone_number` (CharField): Optional contact number
- `avatar` (ImageField): Profile picture
- `is_active`, `is_staff`, `is_superuser` (BooleanField): Account status
- `created_at`, `updated_at`, `last_login` (DateTimeField): Timestamps

**Relationships:**

- One-to-One with Teacher (via `teacher_profile`)
- One-to-One with Student (via `student_profile`)

### Studio

Represents a music studio or school.

**Fields:**

- `id` (UUID): Primary key
- `name` (CharField): Studio name
- `slug` (SlugField): URL-friendly identifier
- `description` (TextField): Studio description
- `website`, `email`, `phone` (CharField): Contact information
- `address`, `city`, `state`, `country`, `postal_code` (CharField): Location
- `logo` (ImageField): Studio logo
- `theme_color` (CharField): Brand color
- `settings` (JSONField): Custom settings
- `layout_data` (JSONField): Studio builder layout data
- `is_active` (BooleanField): Studio status
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Has many Teachers
- Has many Students
- Has many Resources
- Has many Inventory Items

### Teacher

Teacher profile extending User.

**Fields:**

- `id` (UUID): Primary key
- `user` (OneToOneField → User): Associated user account
- `studio` (ForeignKey → Studio): Studio affiliation
- `bio` (TextField): Teacher biography
- `specialties` (JSONField): List of specialties/instruments
- `hourly_rate` (DecimalField): Default lesson rate
- `is_accepting_students` (BooleanField): Availability status
- `booking_buffer_minutes` (IntegerField): Time between lessons
- `is_active` (BooleanField): Active status
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Belongs to User
- Belongs to Studio
- Has many Lessons (as teacher)
- Has many Students (as primary teacher)

### Student

Student profile extending User.

**Fields:**

- `id` (UUID): Primary key
- `user` (OneToOneField → User): Associated user account
- `studio` (ForeignKey → Studio): Studio enrollment
- `family` (ForeignKey → Family, nullable): Family membership
- `primary_teacher` (ForeignKey → Teacher, nullable): Default teacher
- `instrument` (CharField): Primary instrument
- `specialties` (JSONField): List of instruments/subjects
- `date_of_birth` (DateField): Birth date
- `emergency_contact_name`, `emergency_contact_phone` (CharField): Emergency info
- `enrollment_date` (DateField): When student joined
- `notes` (TextField): General notes
- `is_active` (BooleanField): Active enrollment status
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Belongs to User
- Belongs to Studio
- Optionally belongs to Family
- Optionally has primary Teacher
- Has many Lessons
- Has many Goals
- Has many Resource Checkouts

### Family

Groups multiple students for billing purposes.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Studio association
- `name` (CharField): Family name
- `primary_contact` (ForeignKey → User): Primary parent/guardian
- `phone_number` (CharField): Contact phone
- `address` (TextField): Mailing address
- `billing_email` (EmailField): Email for invoices
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Has many Students
- Has many Invoices
- Has many Payment Methods

### Band

Groups students into bands/ensembles for billing.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Studio association
- `name` (CharField): Band name
- `primary_contact` (ForeignKey → User): Band leader/contact
- `members` (ManyToManyField → User): Band members
- `email`, `phone_number` (CharField): Contact information
- `address`, `city`, `state`, `postal_code`, `country` (CharField): Location
- `notes` (TextField): Additional information
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Has many User members
- Has many Invoices
- Has many Payment Methods

## Lessons Models

### Lesson

Individual lesson instance.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Studio where lesson occurs
- `teacher` (ForeignKey → Teacher): Instructor
- `student` (ForeignKey → Student): Student attending
- `scheduled_start`, `scheduled_end` (DateTimeField): Scheduled time
- `actual_start`, `actual_end` (DateTimeField, nullable): Actual time
- `location` (CharField): Room or platform
- `lesson_type` (CharField): Private, group, ensemble, online
- `status` (CharField): Scheduled, in_progress, completed, cancelled, no_show
- `recurring_pattern` (ForeignKey → RecurringPattern, nullable): If from recurring
- `cancellation_reason` (TextField): Why cancelled
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Belongs to Studio, Teacher, Student
- Optionally belongs to RecurringPattern
- Has many LessonNotes

**Methods:**

- `duration_minutes()`: Calculate lesson length

### RecurringPattern

Defines recurring lesson schedules.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Studio association
- `teacher` (ForeignKey → Teacher): Assigned teacher
- `student` (ForeignKey → Student): Enrolled student
- `frequency` (CharField): Weekly, bi-weekly, monthly
- `day_of_week` (CharField): Monday-Sunday
- `time` (TimeField): Lesson start time
- `duration_minutes` (IntegerField): Lesson length
- `start_date` (DateField): Pattern start
- `end_date` (DateField, nullable): Pattern end
- `is_active` (BooleanField): Active pattern
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Generates many Lessons

### LessonNote

Detailed notes for a lesson.

**Fields:**

- `id` (UUID): Primary key
- `lesson` (ForeignKey → Lesson): Associated lesson
- `teacher` (ForeignKey → Teacher): Note author
- `summary` (TextField): Overview of lesson
- `topics_covered`, `assignments`, `strengths`, `challenges` (JSONField): Structured data
- `homework` (TextField): Practice assignments
- `visible_to_student`, `visible_to_parent` (BooleanField): Visibility settings
- `created_at`, `updated_at` (DateTimeField): Timestamps

### StudentGoal

Student progress goals.

**Fields:**

- `id` (UUID): Primary key
- `student` (ForeignKey → Student): Goal owner
- `teacher` (ForeignKey → Teacher): Goal creator
- `title` (CharField): Goal name
- `description` (TextField): Detailed explanation
- `target_date` (DateField, nullable): Completion target
- `status` (CharField): Active, achieved, abandoned
- `progress_percentage` (IntegerField): 0-100
- `created_at`, `updated_at` (DateTimeField): Timestamps

### LessonPlan

Reusable lesson plan templates.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Studio association
- `teacher` (ForeignKey → Teacher): Plan creator
- `title` (CharField): Plan name
- `description` (TextField): Overview
- `specialty` (CharField): Instrument/subject
- `duration_minutes` (IntegerField): Recommended length
- `objectives`, `materials`, `activities` (JSONField): Lesson components
- `tags` (JSONField): Searchable keywords
- `is_public` (BooleanField): Share with other teachers
- `created_at`, `updated_at` (DateTimeField): Timestamps

## Billing Models

### Invoice

Invoice for a family or band.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Issuing studio
- `band` (ForeignKey → Band): Billing entity
- `invoice_number` (CharField): Unique invoice identifier
- `status` (CharField): Draft, sent, paid, partial, overdue, cancelled
- `issue_date` (DateField): Invoice creation date
- `due_date` (DateField): Payment deadline
- `subtotal`, `tax`, `total`, `amount_paid` (DecimalField): Financial amounts
- `notes` (TextField): Additional information
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Relationships:**

- Has many InvoiceLineItems
- Has many Payments

**Methods:**

- `balance_due()`: Calculate remaining balance
- `is_overdue()`: Check if past due date
- `calculate_totals()`: Recalculate from line items

### InvoiceLineItem

Individual line on an invoice.

**Fields:**

- `id` (UUID): Primary key
- `invoice` (ForeignKey → Invoice): Parent invoice
- `description` (CharField): Item description
- `quantity` (IntegerField): Number of items
- `unit_price` (DecimalField): Price per item
- `total_price` (DecimalField): quantity × unit_price
- `lesson` (ForeignKey → Lesson, nullable): Associated lesson if applicable
- `created_at` (DateTimeField): Timestamp

### Payment

Payment record for invoices.

**Fields:**

- `id` (UUID): Primary key
- `invoice` (ForeignKey → Invoice): Invoice being paid
- `amount` (DecimalField): Payment amount
- `payment_method` (CharField): Cash, check, credit_card, etc.
- `transaction_id` (CharField): External payment ID
- `status` (CharField): Pending, completed, failed, refunded
- `notes` (TextField): Payment notes
- `processed_by` (ForeignKey → User, nullable): Who processed
- `processed_at`, `refunded_at` (DateTimeField): Timestamps
- `created_at` (DateTimeField): Timestamp

### PaymentMethod

Saved payment methods for recurring billing.

**Fields:**

- `id` (UUID): Primary key
- `band` (ForeignKey → Band): Owner
- `payment_type` (CharField): Credit card, bank account
- `last_four` (CharField): Last 4 digits
- `stripe_payment_method_id` (CharField): Stripe reference
- `is_default`, `is_active` (BooleanField): Status flags
- `created_at`, `updated_at` (DateTimeField): Timestamps

## Inventory Models

### InventoryItem

Physical items tracked by the studio.

**Fields:**

- `name` (CharField): Item name
- `category` (CharField): Instrument, equipment, sheet-music, accessories, other
- `quantity`, `available_quantity` (IntegerField): Total and available
- `condition` (CharField): Excellent, good, fair, needs-repair
- `status` (CharField): Available, checked-out, maintenance, retired
- `location` (CharField): Where stored
- `value` (DecimalField): Item value
- `serial_number` (CharField): Serial/inventory number
- `is_borrowable` (BooleanField): Can students check out
- `max_checkout_days` (IntegerField): Maximum lending period
- `purchase_date`, `last_maintenance` (DateField): Important dates
- `notes` (TextField): Additional info
- `created_at`, `updated_at` (DateTimeField): Timestamps
- `created_by` (ForeignKey → User): Who added item

**Methods:**

- `is_low_stock()`: Check if available quantity ≤ 2

### CheckoutLog

Track item checkouts.

**Fields:**

- `item` (ForeignKey → InventoryItem): Checked out item
- `student` (ForeignKey → User): Who borrowed
- `quantity` (IntegerField): How many
- `checkout_date`, `due_date`, `return_date` (DateTimeField/DateField): Dates
- `status` (CharField): Pending, approved, returned, overdue, cancelled
- `notes` (TextField): Special instructions
- `approved_by` (ForeignKey → User, nullable): Approver
- `approved_at` (DateTimeField, nullable): Approval time

**Methods:**

- `is_overdue()`: Check if past due date

### PracticeRoom

Practice rooms available for reservation.

**Fields:**

- `name` (CharField): Room identifier
- `capacity` (IntegerField): Max occupancy
- `description` (TextField): Room description
- `equipment` (TextField): Available equipment
- `hourly_rate` (DecimalField): Rental cost
- `is_active` (BooleanField): Room availability

### RoomReservation

Student practice room bookings.

**Fields:**

- `room` (ForeignKey → PracticeRoom): Reserved room
- `student` (ForeignKey → User): Who reserved
- `start_time`, `end_time` (DateTimeField): Reservation period
- `status` (CharField): Pending, confirmed, cancelled, completed, no-show
- `total_cost` (DecimalField): Calculated cost
- `is_paid` (BooleanField): Payment status
- `notes` (TextField): Additional info
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Methods:**

- `save()`: Auto-calculate total_cost from duration and rate
- `clean()`: Validate no overlapping reservations

## Resources Models

### Resource

Digital and physical resources.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Owning studio
- `uploaded_by` (ForeignKey → User): Creator
- `title` (CharField): Resource name
- `description` (TextField): Details
- `resource_type` (CharField): PDF, audio, video, image, physical, link, other
- `file` (FileField): Digital file (if applicable)
- `file_size` (BigIntegerField): File size in bytes
- `mime_type` (CharField): Content type
- `external_url` (URLField): External link (if applicable)
- `tags`, `category` (CharField/JSONField): Organization
- `is_physical_item` (BooleanField): Physical vs digital
- `quantity_total`, `quantity_available` (IntegerField): For physical items
- `is_lendable` (BooleanField): Can be checked out
- `checkout_duration_days` (IntegerField): Lending period
- `is_public` (BooleanField): Visible to all students
- `shared_with_students` (ManyToManyField → Student): Specific access
- `created_at`, `updated_at` (DateTimeField): Timestamps

### ResourceCheckout

Track lending of physical resources.

**Fields:**

- `id` (UUID): Primary key
- `resource` (ForeignKey → Resource): Borrowed resource
- `student` (ForeignKey → Student): Borrower
- `status` (CharField): Checked_out, returned, overdue, lost
- `checked_out_at`, `due_date`, `returned_at` (DateTimeField/DateField): Dates
- `checkout_notes`, `return_notes` (TextField): Documentation
- `created_at`, `updated_at` (DateTimeField): Timestamps

**Methods:**

- `is_overdue()`: Check if past due date

## Messaging Models

### MessageThread

Conversation between users.

**Fields:**

- `id` (UUID): Primary key
- `studio` (ForeignKey → Studio): Studio context
- `participants` (ManyToManyField → User): Thread members
- `subject` (CharField): Thread title
- `created_at`, `updated_at` (DateTimeField): Timestamps

### Message

Individual message in a thread.

**Fields:**

- `id` (UUID): Primary key
- `thread` (ForeignKey → MessageThread): Parent thread
- `sender` (ForeignKey → User): Message author
- `content` (TextField): Message text
- `is_read` (BooleanField): Read status
- `read_by` (ManyToManyField → User): Who has read
- `created_at` (DateTimeField): Timestamp

## Notifications Models

### Notification

System notifications for users.

**Fields:**

- `id` (UUID): Primary key
- `user` (ForeignKey → User): Recipient
- `title` (CharField): Notification title
- `message` (TextField): Notification content
- `notification_type` (CharField): Type of notification
- `is_read` (BooleanField): Read status
- `link` (CharField): Optional action URL
- `created_at` (DateTimeField): Timestamp

## Database Indexes

Key indexes for performance:

**Lessons:**

- `scheduled_start`
- `teacher, scheduled_start`
- `student, scheduled_start`
- `status`

**Invoices:**

- `invoice_number` (unique)
- `band, status`
- `due_date`

**Payments:**

- `transaction_id`
- `invoice, status`

**Resources:**

- `resource_type`
- `studio, is_public`

## Common Patterns

### UUID Primary Keys

All models use UUID primary keys for:

- Security (non-sequential)
- Distribution (no collision risk)
- API design (clean URLs)

### Timestamps

All models include:

- `created_at`: When record was created
- `updated_at`: Last modification time

### Soft Deletes

Many models use `is_active` instead of hard deletes to preserve history.

### JSON Fields

Used for flexible, structured data:

- `specialties`, `tags`, `objectives`, `activities`
- Searchable using PostgreSQL JSON operators

## Related Documentation

- [Architecture](architecture.md) - Overall system architecture
- [API Reference](api.md) - API endpoints
