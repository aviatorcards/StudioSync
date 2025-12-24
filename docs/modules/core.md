# Core System Module

The Core System module provides the foundational infrastructure for StudioSync, including user management, studio configuration, role-based access control, and multi-tenancy support.

## Overview

The core system handles:

- **User Authentication & Management**: Email-based authentication with JWT tokens
- **Studio Management**: Multi-studio support and configuration
- **Role-Based Access Control**: Admin, teacher, student, and parent roles
- **Profile Management**: Teacher and student profiles
- **Multi-Tenancy**: Support for multiple independent studios

## User Management

### User Model

StudioSync uses a custom user model with email-based authentication instead of usernames.

**Key Features:**
- Email as unique identifier
- Password hashing with Django's PBKDF2
- Optional phone number and avatar
- Automatic timestamp tracking (created_at, updated_at, last_login)

### User Roles

Four primary roles with distinct permissions:

#### Admin
**Capabilities:**
- Full system access
- Manage studio settings
- Add/remove teachers and students
- View all data
- Configure billing and payments
- Manage inventory and resources
- Access all reports

#### Teacher
**Capabilities:**
- Manage their own students
- Schedule and modify lessons
- Add lesson notes and assignments
- Create lesson plans
- Upload resources
- View billing for their students
- Message students and parents

#### Student
**Capabilities:**
- View their own schedule and lessons
- Access lesson notes (when visible)
- Download shared resources
- Message their teachers
- Request inventory checkouts
- Reserve practice rooms
- View their own goals and progress

#### Parent
**Capabilities:**
- View all children's information
- See lesson schedules for family
- Access lesson notes for family members
- Receive notifications
- View and pay invoices
- Message teachers on behalf of students

### Authentication Flow

1. **Registration:**
   - User provides email, password, and basic information
   - System creates User account
   - Assigns default role (typically 'student')
   - Sends verification email (if configured)

2. **Login:**
   - User submits email and password
   - System validates credentials
   - Returns JWT access and refresh tokens
   - Frontend stores tokens for API requests

3. **Token Refresh:**
   - Access tokens expire after set duration
   - Refresh token used to obtain new access token
   - Refresh tokens have longer expiration

4. **Logout:**
   - Frontend discards tokens
   - Refresh token can be blacklisted (if configured)

## Studio Management

### Studio Model

Each studio represents an independent music school or teaching practice.

**Studio Features:**

**Branding:**
- Studio name and description
- Logo image
- Theme color for customization
- Website and contact information

**Location:**
- Physical address
- City, state, postal code
- Country

**Configuration:**
- Custom settings (JSON field for flexibility)
- Timezone
- Currency
- Business hours
- Studio-specific policies

**Studio Builder:**
- Layout data for visual studio layout
- Room configurations
- Equipment placement

### Multi-Studio Support

StudioSync supports multiple independent studios in a single installation:

**Multi-Tenancy Features:**

1. **Data Isolation:**
   - Each studio's data is separate
   - Teachers/students belong to specific studios
   - Resources scoped to studio
   - Billing isolated per studio

2. **Subdomain Access:**
   - Each studio can have custom subdomain
   - Example: `rockschool.studiosync.com`
   - Public-facing teacher profiles
   - Student enrollment pages

3. **Shared Infrastructure:**
   - Single codebase
   - Shared database with studio filtering
   - Centralized authentication
   - Common notification system

## Teacher & Student Profiles

### Teacher Profiles

Extended profiles for teaching staff:

**Profile Information:**
- Biography and qualifications
- Specialties/instruments taught
- Hourly rate
- Availability status
- Booking buffer time (minutes between lessons)

**Public Profile:**
- Bio page accessible via subdomain
- Display specialties and experience
- Student testimonials (future feature)
- Booking calendar availability

### Student Profiles

Comprehensive student information:

**Academic Information:**
- Primary instrument
- Multiple specialties
- Skill level tracking
- Enrollment date
- Current repertoire

**Personal Information:**
- Date of birth
- Emergency contact details
- Medical/allergy notes
- Parent/guardian information

**Progress Tracking:**
- Attendance history
- Lesson notes
- Goals and achievements
- Performance recordings

## Specialty Management

Students and teachers can have multiple specialties:

**Common Specialties:**
- Piano
- Guitar (acoustic, electric, bass)
- Drums/Percussion
- Voice/Vocal
- Violin/Strings
- Brass (trumpet, trombone, etc.)
- Woodwinds (flute, clarinet, saxophone, etc.)
- Music Theory
- Composition
- Music Production

## Permissions & Security

### Permission System

Django's built-in permission system extended with custom permissions:

**Permission Levels:**

1. **View Permissions:** Who can see what data
2. **Edit Permissions:** Who can modify data
3. **Delete Permissions:** Restricted to admins
4. **Admin Permissions:** Full access to all features

### Data Privacy

- Students only see their own data
- Teachers see their assigned students
- Parents see their children's data
- Admins have full studio access
- GDPR compliance features

See [GDPR Compliance](../GDPR_COMPLIANCE.md) for detailed privacy documentation.

## Related Documentation

- [User Management & Roles](../SETTINGS_STATUS.md)
- [GDPR Compliance](../GDPR_COMPLIANCE.md)
- [Notification System](../NOTIFICATION_SYSTEM.md)
- [Appearance System](../APPEARANCE_SYSTEM.md)
- [API Reference](../api.md)
- [Database Schema](../database.md)
