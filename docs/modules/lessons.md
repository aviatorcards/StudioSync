# Lessons & Calendar Module

The Lessons & Calendar module is the heart of StudioSync, providing comprehensive lesson scheduling, attendance tracking, detailed lesson notes, and student goal management.

## Overview

This module enables studios to:

- Schedule individual and recurring lessons
- Manage teacher and student calendars
- Track attendance and lesson completion
- Record detailed lesson notes and assignments
- Create and manage reusable lesson plans
- Set and track student goals

## Lesson Scheduling

### Individual Lessons

Schedule one-time lessons with complete flexibility:

**Lesson Details:**
- **Student**: Who is taking the lesson
- **Teacher**: Who is teaching
- **Date & Time**: Scheduled start and end times
- **Duration**: Automatically calculated from start/end times
- **Location**: Room or online platform
- **Lesson Type**: Private, group, or ensemble
- **Notes**: Special instructions or requirements

**Lesson Status:**
- **Scheduled**: Future lesson confirmed
- **In Progress**: Currently happening
- **Completed**: Finished successfully
- **Cancelled**: Lesson was cancelled
- **No Show**: Student didn't attend

### Recurring Patterns

Automate lesson scheduling with recurring patterns:

**Frequency Options:**
- Weekly (every week)
- Bi-weekly (every 2 weeks)
- Monthly (once per month)

**Pattern Configuration:**
- **Day of Week**: Monday through Sunday
- **Time**: Specific time slot
- **Duration**: Length of each lesson
- **Start Date**: When pattern begins
- **End Date**: Optional end date (or ongoing)

**Example Pattern:**
```
Student: Sarah Johnson
Teacher: Mr. Smith
Day: Tuesday
Time: 4:00 PM
Duration: 60 minutes
Frequency: Weekly
Start: January 15, 2025
End: June 1, 2025
```

This creates a lesson every Tuesday at 4:00 PM for the specified period.

### Group Lessons

Schedule lessons for multiple students:

- Multiple students can attend one lesson
- Useful for ensemble practice, theory classes, or band rehearsals
- Billed individually or as a group

### Calendar Integration

The calendar view provides:

**Features:**
- **Monthly/Weekly/Daily Views**: Multiple visualization options
- **Color Coding**: By teacher, student, or lesson type
- **Conflict Detection**: Prevents double-booking
- **Availability Display**: Shows teacher free time
- **Drag and Drop**: Easy rescheduling (admin feature)

**Calendar Privacy:**
See [Calendar Privacy Guide](../CALENDAR_PRIVACY_GUIDE.md) for detailed privacy settings.

## Attendance Tracking

### Recording Attendance

For each lesson instance:

- Mark student as attended, absent, or late
- Record actual lesson duration
- Note cancellation reason if applicable
- Track no-shows separately

### Attendance History

View comprehensive attendance data:

- **By Student**: See individual attendance records
- **By Teacher**: Monitor class attendance rates
- **Date Range**: Filter by time periods
- **Statistics**: Attendance percentage, no-show rate

### Attendance Reports

Generate reports showing:
- Students with frequent absences
- Peak attendance times
- Teacher utilization rates
- Cancellation patterns

## Lesson Notes & Documentation

### Lesson Notes

After each lesson, teachers can record detailed notes:

**Note Components:**

1. **Summary**: Overview of what was covered
2. **Topics Covered**: Specific skills or pieces worked on
   ```json
   ["Scales - C Major", "Bach Prelude in C", "Sight reading"]
   ```

3. **Assignments**: Practice tasks for the student
   ```json
   ["Practice C Major scale 10 minutes daily", 
    "Work on measures 1-16 of Bach Prelude"]
   ```

4. **Progress Notes**: How the student is improving
5. **Challenges**: Areas needing extra work
6. **Achievements**: Milestones reached

**Visibility Settings:**
- **Visible to Student**: Students can read the notes
- **Visible to Parent**: Parents/guardians can see notes
- **Teacher Only**: Private notes for teacher reference

### Lesson Plans

Create reusable lesson plan templates:

**Lesson Plan Features:**

- **Title**: Descriptive name
- **Description**: Detailed overview
- **Target Level**: Beginner, Intermediate, Advanced
- **Specialty**: Instrument or subject
- **Duration**: Recommended lesson length
- **Objectives**: Learning goals
  ```json
  ["Master proper bow hold", 
   "Learn first position notes",
   "Play simple melody"]
  ```

- **Materials**: Required resources
  ```json
  ["Essential Elements Book 1 pg 10-12",
   "Bow hold diagram handout"]
  ```

- **Activities**: Step-by-step lesson structure
  ```json
  ["Warm up: Open strings 5 min",
   "Bow hold review: 10 min",
   "New notes: 15 min",
   "Simple melody: 20 min",
   "Review & assign practice: 10 min"]
  ```

- **Tags**: Searchable keywords
- **Public/Private**: Share with other teachers or keep private

### Repertoire Tracking

Track pieces each student is working on:

- Current pieces in progress
- Completed pieces (repertoire)
- Performance-ready pieces
- Recital selections

## Student Goals

### Goal Setting

Create specific, trackable goals for students:

**Goal Details:**

- **Student**: Who the goal is for
- **Title**: Short description
  - "Learn Für Elise"
  - "Master jazz improvisation"
  - "Prepare for Grade 5 exam"

- **Description**: Detailed explanation of the goal
- **Target Date**: Optional completion deadline
- **Progress Percentage**: 0-100%
- **Status**: Active, Achieved, or Abandoned

### Progress Tracking

Monitor student progress toward goals:

1. **Initial Setup**: Create goal at 0%
2. **Regular Updates**: Teacher updates percentage in lesson notes
3. **Milestone Marking**: Note significant progress points
4. **Completion**: Mark as "Achieved" when done
5. **Review**: Reflect on goal completion

**Example Progress:**
```
Goal: Learn Moonlight Sonata (1st Movement)
Week 1: 0% - Introduction, start learning first page
Week 4: 25% - First page solid, working on second
Week 8: 50% - First half memorized
Week 12: 75% - Full piece learned, polishing
Week 16: 100% - Performance ready! Goal Achieved
```

### Goal Categories

Common goal types:

**Technical Goals:**
- Master specific technique (vibrato, double-tonguing)
- Achieve specific tempo
- Improve sight-reading ability

**Repertoire Goals:**
- Learn specific piece
- Build performance repertoire
- Prepare for recital

**Academic Goals:**
- Pass graded exam (ABRSM, RCM)
- Complete method book
- Prepare for audition

**Performance Goals:**
- Prepare for recital
- Record video performance
- Perform at competition

## Lesson Analytics

### For Teachers

Track teaching effectiveness:
- Total lessons taught
- Average lesson duration
- Student retention rates
- Most common lesson topics

### For Students

Monitor learning journey:
- Total lessons attended
- Attendance rate
- Goals achieved
- Pieces completed
- Practice time correlation

### For Studios

Understand studio operations:
- Total lessons per month
- Peak scheduling times
- Teacher utilization
- Student enrollment trends
- Revenue per lesson type

## Scheduling Best Practices

### Conflict Prevention

The system helps prevent conflicts:

1. **Teacher Availability**: Check teacher schedule before booking
2. **Student Conflicts**: Warn if student has overlapping lesson
3. **Room Booking**: Track room usage to prevent double-booking
4. **Buffer Time**: Optional buffer between lessons for setup

### Cancellation Policies

Implement cancellation rules:

- **Advance Notice**: Require 24-48 hours notice
- **Make-Up Lessons**: Track lessons to be rescheduled
- **No-Show Policy**: Document repeated no-shows
- **Weather Cancellations**: Batch cancel during closures

### Rescheduling Workflow

1. Student/teacher requests reschedule
2. Find mutually available time
3. Update lesson record
4. Send notifications to all parties
5. Update calendar and recurring pattern if needed

## Integration with Other Modules

### Billing Integration

- Completed lessons appear on invoices
- Track which lessons have been billed
- Cancelled lessons can be credited
- Make-up lessons tracked separately

### Messaging Integration

- Send lesson reminders
- Share lesson notes with students
- Request feedback from students/parents
- Notify about schedule changes

### Resource Library Integration

- Attach resources to lesson notes
- Link lesson plans to digital materials
- Share practice recordings
- Provide supplementary materials

## Notifications & Reminders

Automated notifications for:

- **24-hour reminder**: Upcoming lesson notification
- **Lesson completion**: Request for parent/student feedback
- **Schedule changes**: Cancellations or time changes
- **Goal progress**: Milestone achievements
- **Attendance issues**: Multiple missed lessons

## Mobile Access

Students and teachers can access on mobile:

- View upcoming lessons
- Check lesson notes and assignments
- Mark attendance
- Add quick notes
- View goals and progress

## Permissions

### Student Permissions

Students can:
- View their own lessons and schedule
- Read lesson notes (if visible to student)
- View their goals and progress
- Request lesson reschedules (if enabled)

### Teacher Permissions

Teachers can:
- Schedule lessons for their students
- Add and edit lesson notes
- Create lesson plans
- Set student goals
- Mark attendance
- View student progress

### Admin Permissions

Admins can:
- Schedule any lesson
- Override conflicts
- Manage all lesson plans
- View all lesson data
- Generate reports
- Configure scheduling rules

## Related Documentation

- [Calendar Privacy Guide](../CALENDAR_PRIVACY_GUIDE.md) - Privacy settings for calendar
- [Students Module](students.md) - Student management
- [Resource Library](resources.md) - Sharing materials
- [Messaging](messaging.md) - Communication with students
