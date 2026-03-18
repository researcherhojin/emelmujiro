import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.utils import timezone

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    """Consumer for real-time notifications"""

    async def connect(self):
        self.user = self.scope.get("user")

        if self.user and not isinstance(self.user, AnonymousUser):
            self.user_group_name = f"notifications_{self.user.id}"

            # Join user notification group
            await self.channel_layer.group_add(self.user_group_name, self.channel_name)

            await self.accept()

            # Send connection confirmation
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "connection_established",
                        "message": "Notification channel connected",
                        "timestamp": timezone.now().isoformat(),
                    }
                )
            )
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, "user_group_name"):
            # Leave notification group
            await self.channel_layer.group_discard(self.user_group_name, self.channel_name)

    async def receive(self, text_data):
        # Handle any client-side notification interactions
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({"error": "Invalid JSON"}))
            return

        action = text_data_json.get("action")

        if action == "mark_read":
            notification_id = text_data_json.get("notification_id")
            if notification_id is not None:
                await self.mark_notification_read(notification_id)
                count = await self.get_unread_count()
                await self.send(
                    text_data=json.dumps(
                        {
                            "type": "notification_update",
                            "count": count,
                            "timestamp": timezone.now().isoformat(),
                        }
                    )
                )
        elif action == "mark_all_read":
            await self.mark_all_notifications_read()
            await self.send(
                text_data=json.dumps(
                    {
                        "type": "notification_update",
                        "count": 0,
                        "timestamp": timezone.now().isoformat(),
                    }
                )
            )

    async def send_notification(self, event):
        # Send notification to WebSocket
        await self.send(
            text_data=json.dumps(
                {
                    "type": "notification",
                    "id": event.get("id"),
                    "title": event.get("title"),
                    "message": event.get("message"),
                    "level": event.get("level", "info"),
                    "notification_type": event.get("notification_type", "system"),
                    "url": event.get("url"),
                    "timestamp": event.get("timestamp", timezone.now().isoformat()),
                }
            )
        )

    async def notification_update(self, event):
        # Send notification update
        await self.send(
            text_data=json.dumps(
                {
                    "type": "notification_update",
                    "count": event.get("count", 0),
                    "timestamp": event.get("timestamp", timezone.now().isoformat()),
                }
            )
        )

    @database_sync_to_async
    def get_unread_count(self):
        from .models import Notification

        return Notification.objects.filter(user=self.user, is_read=False).count()

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        from .models import Notification

        try:
            notification = Notification.objects.get(id=notification_id, user=self.user)
            if not notification.is_read:
                notification.is_read = True
                notification.read_at = timezone.now()
                notification.save(update_fields=["is_read", "read_at"])
        except Notification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user {self.user.id}")

    @database_sync_to_async
    def mark_all_notifications_read(self):
        from .models import Notification

        Notification.objects.filter(user=self.user, is_read=False).update(is_read=True, read_at=timezone.now())
