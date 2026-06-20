import logging
import urllib.request
from datetime import datetime
from django.utils import timezone
import icalendar
import pytz

from apps.core.models import Band
from .models import BandExternalEvent

logger = logging.getLogger(__name__)

def sync_all_band_calendars():
    """
    Background task to sync all bands that have an iCal feed configured.
    """
    bands = Band.objects.exclude(ical_feed_url="").exclude(ical_feed_url__isnull=True)
    for band in bands:
        try:
            sync_band_calendar(band.id)
        except Exception as e:
            logger.error(f"Failed to sync calendar for band {band.id}: {str(e)}")

def sync_band_calendar(band_id):
    """
    Fetch and parse iCal feed for a specific band, updating their BandExternalEvent records.
    """
    band = Band.objects.get(id=band_id)
    if not band.ical_feed_url:
        return

    # Fetch the .ics file
    req = urllib.request.Request(band.ical_feed_url, headers={'User-Agent': 'StudioSync/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            ical_data = response.read()
    except Exception as e:
        logger.error(f"Error fetching calendar for {band.name}: {e}")
        return

    cal = icalendar.Calendar.from_ical(ical_data)
    
    # We will track which UIDs we saw in the feed so we can delete ones that were removed
    seen_uids = set()

    for component in cal.walk('vevent'):
        uid = str(component.get('uid'))
        if not uid or uid == 'None':
            continue
            
        seen_uids.add(uid)
        
        summary = str(component.get('summary', 'Busy'))
        description = str(component.get('description', ''))
        
        dtstart = component.get('dtstart')
        dtend = component.get('dtend')
        
        if not dtstart or not dtend:
            continue
            
        start_dt = dtstart.dt
        end_dt = dtend.dt
        
        # Convert date to datetime if it's an all-day event
        if not isinstance(start_dt, datetime):
            start_dt = timezone.make_aware(datetime.combine(start_dt, datetime.min.time()))
            
        # If dtend is a date (not datetime), it's exclusive. 
        # iCal says end date is the day AFTER the event ends. So we subtract a tiny bit or just map to end of day.
        if not isinstance(end_dt, datetime):
            end_dt = timezone.make_aware(datetime.combine(end_dt, datetime.min.time()))
            
        # Ensure timezone awareness for datetimes
        if isinstance(start_dt, datetime) and timezone.is_naive(start_dt):
            start_dt = timezone.make_aware(start_dt, timezone=pytz.UTC)
        if isinstance(end_dt, datetime) and timezone.is_naive(end_dt):
            end_dt = timezone.make_aware(end_dt, timezone=pytz.UTC)

        # Update or create the event
        BandExternalEvent.objects.update_or_create(
            band=band,
            uid=uid,
            defaults={
                'title': summary[:255],
                'description': description,
                'start_time': start_dt,
                'end_time': end_dt,
            }
        )

    # Delete any future events in our DB that are no longer in the feed
    # (We only delete future events because past events might have legitimately dropped off the feed)
    now = timezone.now()
    BandExternalEvent.objects.filter(
        band=band,
        start_time__gte=now
    ).exclude(
        uid__in=seen_uids
    ).delete()

    # Update last sync time
    band.last_calendar_sync = timezone.now()
    band.save(update_fields=['last_calendar_sync'])

    logger.info(f"Successfully synced calendar for band {band.name}")
