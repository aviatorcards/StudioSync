import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from stream_chat import StreamChat

c = StreamChat(api_key=settings.STREAM_API_KEY, api_secret=settings.STREAM_API_SECRET)
q = c.query_channels({'type': 'messaging'})
for ch in q['channels']:
    for m in ch['members']:
        if m['user_id'] == '4ab888f5-fe40-428a-8a58-e4b2d4f24ef6':
            try:
                c.channel('messaging', ch['channel']['id']).show('4ab888f5-fe40-428a-8a58-e4b2d4f24ef6')
                print("unhid", ch['channel']['id'])
            except Exception as e:
                print("failed", e)
