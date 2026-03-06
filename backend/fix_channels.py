import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from stream_chat import StreamChat

client = StreamChat(api_key=settings.STREAM_API_KEY, api_secret=settings.STREAM_API_SECRET)

channels = client.query_channels({"type": "messaging"})
for channel in channels['channels']:
    channel_id = channel['channel']['id']
    members = channel['members']
    if len(members) == 2:
        print(f"Updating channel {channel_id}")
        client.update_channel('messaging', channel_id, {'name': ''}, update_message="Channel name reset")

print("Done!")
