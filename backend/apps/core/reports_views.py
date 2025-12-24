"""
Reports and Analytics Export Views
Generate CSV exports for various reports
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q
from datetime import timedelta
import csv

from apps.lessons.models import Lesson
from apps.core.models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_report(request):
    """
    Export various reports as CSV
    Query param: ?type=financial|attendance|student-progress
    """
    report_type = request.GET.get('type', 'financial')
    
    if report_type == 'financial':
        return export_financial_summary(request)
    elif report_type == 'attendance':
        return export_attendance_report(request)
    elif report_type == 'student-progress':
        return export_student_progress(request)
    else:
        return Response({'error': 'Invalid report type'}, status=400)


def export_financial_summary(request):
    """
    Financial Summary Report
    Income, expenses, and outstanding invoices
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="financial_summary_{timezone.now().strftime("%Y%m%d")}.csv"'
    
    writer = csv.writer(response)
    
    # Header
    writer.writerow(['Financial Summary Report'])
    writer.writerow([f'Generated: {timezone.now().strftime("%Y-%m-%d %H:%M")}'])
    writer.writerow([])
    
    # Summary statistics
    writer.writerow(['Summary'])
    writer.writerow(['Metric', 'Value'])
    
    # Calculate totals
    total_lessons = Lesson.objects.filter(status='completed').count()
    total_scheduled = Lesson.objects.filter(status='scheduled').count()
    total_cancelled = Lesson.objects.filter(status='cancelled').count()
    
    writer.writerow(['Total Completed Lessons', total_lessons])
    writer.writerow(['Total Scheduled Lessons', total_scheduled])
    writer.writerow(['Total Cancelled Lessons', total_cancelled])
    writer.writerow([])
    
    # Monthly breakdown
    writer.writerow(['Monthly Breakdown (Last 6 Months)'])
    writer.writerow(['Month', 'Completed Lessons', 'Scheduled Lessons', 'Cancellations'])
    
    for i in range(6):
        month_start = timezone.now().replace(day=1) - timedelta(days=30 * i)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        
        completed = Lesson.objects.filter(
            status='completed',
            scheduled_start__gte=month_start,
            scheduled_start__lt=month_end
        ).count()
        
        scheduled = Lesson.objects.filter(
            status='scheduled',
            scheduled_start__gte=month_start,
            scheduled_start__lt=month_end
        ).count()
        
        cancelled = Lesson.objects.filter(
            status='cancelled',
            scheduled_start__gte=month_start,
            scheduled_start__lt=month_end
        ).count()
        
        writer.writerow([
            month_start.strftime('%B %Y'),
            completed,
            scheduled,
            cancelled
        ])
    
    return response


def export_attendance_report(request):
    """
    Attendance Report
    Student attendance rates, cancellations, and make-ups
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="attendance_report_{timezone.now().strftime("%Y%m%d")}.csv"'
    
    writer = csv.writer(response)
    
    # Header
    writer.writerow(['Attendance Report'])
    writer.writerow([f'Generated: {timezone.now().strftime("%Y-%m-%d %H:%M")}'])
    writer.writerow([])
    
    # Column headers
    writer.writerow([
        'Student Name',
        'Email',
        'Total Lessons',
        'Completed',
        'Cancelled',
        'No-Shows',
        'Attendance Rate (%)'
    ])
    
    # Get all students who have had lessons
    students = User.objects.filter(role='student').annotate(
        total_lessons=Count('student_lessons'),
        completed_lessons=Count('student_lessons', filter=Q(student_lessons__status='completed')),
        cancelled_lessons=Count('student_lessons', filter=Q(student_lessons__status='cancelled')),
        noshow_lessons=Count('student_lessons', filter=Q(student_lessons__status='no-show'))
    ).filter(total_lessons__gt=0)
    
    for student in students:
        attendance_rate = 0
        if student.total_lessons > 0:
            attendance_rate = (student.completed_lessons / student.total_lessons) * 100
        
        writer.writerow([
            student.get_full_name(),
            student.email,
            student.total_lessons,
            student.completed_lessons,
            student.cancelled_lessons,
            student.noshow_lessons,
            f'{attendance_rate:.1f}%'
        ])
    
    # Summary
    writer.writerow([])
    writer.writerow(['Overall Statistics'])
    total_students = students.count()
    avg_attendance = students.aggregate(
        avg_rate=Avg('completed_lessons') * 100 / Avg('total_lessons') if students.exists() else 0
    )
    
    writer.writerow(['Total Students', total_students])
    writer.writerow(['Average Attendance Rate', f'{avg_attendance.get("avg_rate", 0):.1f}%'])
    
    return response


def export_student_progress(request):
    """
    Student Progress Report
    Goal completion rates and retention statistics
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="student_progress_{timezone.now().strftime("%Y%m%d")}.csv"'
    
    writer = csv.writer(response)
    
    # Header
    writer.writerow(['Student Progress Report'])
    writer.writerow([f'Generated: {timezone.now().strftime("%Y-%m-%d %H:%M")}'])
    writer.writerow([])
    
    # Column headers
    writer.writerow([
        'Student Name',
        'Email',
        'Instrument',
        'Enrollment Date',
        'Total Lessons',
        'Last Lesson Date',
        'Active Status'
    ])
    
    # Get all students
    students = User.objects.filter(role='student').annotate(
        total_lessons=Count('student_lessons'),
        last_lesson_date=Max('student_lessons__scheduled_start')
    )
    
    for student in students:
        # Determine if active (had lesson in last 30 days)
        is_active = False
        if student.last_lesson_date:
            days_since_last = (timezone.now().date() - student.last_lesson_date.date()).days
            is_active = days_since_last <= 30
        
        writer.writerow([
            student.get_full_name(),
            student.email,
            student.instrument or 'Not specified',
            student.created_at.strftime('%Y-%m-%d') if student.created_at else 'N/A',
            student.total_lessons,
            student.last_lesson_date.strftime('%Y-%m-%d') if student.last_lesson_date else 'Never',
            'Active' if is_active else 'Inactive'
        ])
    
    # Summary
    writer.writerow([])
    writer.writerow(['Summary Statistics'])
    
    total_students = students.count()
    active_students = sum(1 for s in students if s.last_lesson_date and (timezone.now().date() - s.last_lesson_date.date()).days <= 30)
    retention_rate = (active_students / total_students * 100) if total_students > 0 else 0
    
    writer.writerow(['Total Students', total_students])
    writer.writerow(['Active Students (last 30 days)', active_students])
    writer.writerow(['Retention Rate', f'{retention_rate:.1f}%'])
    
    return response


# Import Max for student progress report
from django.db.models import Max
