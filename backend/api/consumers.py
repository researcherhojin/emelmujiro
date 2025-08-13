import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from datetime import datetime

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs'].get('room_name', 'general')
        self.room_group_name = f'chat_{self.room_name}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send welcome message
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Welcome to the chat!',
            'room': self.room_name,
            'timestamp': datetime.now().isoformat()
        }))
        
        # Notify others that a user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user': await self.get_username(),
                'timestamp': datetime.now().isoformat()
            }
        )

    async def disconnect(self, close_code):
        # Notify others that a user left
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_left',
                'user': await self.get_username(),
                'timestamp': datetime.now().isoformat()
            }
        )
        
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json.get('message', '')
        message_type = text_data_json.get('type', 'chat_message')
        
        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': message_type,
                'message': message,
                'user': await self.get_username(),
                'timestamp': datetime.now().isoformat(),
                'room': self.room_name
            }
        )

    async def chat_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'user': event['user'],
            'timestamp': event['timestamp'],
            'room': event.get('room', self.room_name)
        }))

    async def user_joined(self, event):
        # Send user joined notification
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'user': event['user'],
            'message': f"{event['user']} joined the chat",
            'timestamp': event['timestamp']
        }))

    async def user_left(self, event):
        # Send user left notification
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'user': event['user'],
            'message': f"{event['user']} left the chat",
            'timestamp': event['timestamp']
        }))

    async def typing_indicator(self, event):
        # Send typing indicator
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'user': event['user'],
            'is_typing': event.get('is_typing', False),
            'timestamp': event['timestamp']
        }))

    async def file_upload(self, event):
        # Handle file upload notification
        await self.send(text_data=json.dumps({
            'type': 'file_upload',
            'user': event['user'],
            'file_name': event.get('file_name', ''),
            'file_url': event.get('file_url', ''),
            'file_type': event.get('file_type', ''),
            'timestamp': event['timestamp']
        }))

    async def system_message(self, event):
        # Send system message
        await self.send(text_data=json.dumps({
            'type': 'system_message',
            'message': event['message'],
            'level': event.get('level', 'info'),
            'timestamp': event['timestamp']
        }))

    @database_sync_to_async
    def get_username(self):
        user = self.scope.get('user')
        if user and not isinstance(user, AnonymousUser):
            return user.username
        return f"Guest_{self.channel_name[-8:]}"


class NotificationConsumer(AsyncWebsocketConsumer):
    """Consumer for real-time notifications"""
    
    async def connect(self):
        self.user = self.scope.get('user')
        
        if self.user and not isinstance(self.user, AnonymousUser):
            self.user_group_name = f'notifications_{self.user.id}'
            
            # Join user notification group
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Notification channel connected',
                'timestamp': datetime.now().isoformat()
            }))
        else:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            # Leave notification group
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # Handle any client-side notification interactions
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')
        
        if action == 'mark_read':
            notification_id = text_data_json.get('notification_id')
            await self.mark_notification_read(notification_id)
        elif action == 'mark_all_read':
            await self.mark_all_notifications_read()

    async def send_notification(self, event):
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'id': event.get('id'),
            'title': event.get('title'),
            'message': event.get('message'),
            'level': event.get('level', 'info'),
            'url': event.get('url'),
            'timestamp': event.get('timestamp', datetime.now().isoformat())
        }))

    async def notification_update(self, event):
        # Send notification update
        await self.send(text_data=json.dumps({
            'type': 'notification_update',
            'count': event.get('count', 0),
            'timestamp': event.get('timestamp', datetime.now().isoformat())
        }))

    @database_sync_to_async
    def mark_notification_read(self, notification_id):
        # Mark specific notification as read
        pass  # Implement based on your notification model

    @database_sync_to_async
    def mark_all_notifications_read(self):
        # Mark all notifications as read for the user
        pass  # Implement based on your notification model