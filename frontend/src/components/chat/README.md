# Chat Feature Documentation

A comprehensive real-time customer support chat system built with React, TypeScript, and modern web technologies.

## Features

### Core Features
- **Floating Chat Button**: Fixed position button in bottom-right corner with status indicators
- **Expandable Chat Window**: Full-featured chat interface with header, messages, and input
- **Minimize/Maximize**: Collapsible chat window functionality
- **Connection Status**: Real-time display of connection status
- **Unread Message Badge**: Visual indicator for new messages
- **Business Hours**: Automatic business hours detection and display

### User Experience
- **Smooth Animations**: Powered by Framer Motion for fluid transitions
- **Dark Mode Support**: Seamless integration with application theme
- **Mobile Responsive**: Optimized for mobile and desktop devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Multi-language**: Korean/English localization support

### Chat Interface
- **Message Types**: Support for text, images, files, and system messages
- **Message Status**: Sent, delivered, read indicators for user messages
- **Typing Indicator**: Real-time typing status display
- **Auto-scroll**: Smart scroll behavior with manual scroll-to-bottom button
- **Message Timestamps**: Relative and absolute time formatting

### Interactive Features
- **Quick Replies**: Pre-defined response buttons for common inquiries
- **Emoji Picker**: Rich emoji selector with categories and search
- **File Upload**: Drag-and-drop file upload with preview and validation
- **Sound Notifications**: Audio alerts for new messages (when chat is closed)

### Technical Features
- **WebSocket Connection**: Real-time communication with fallback to polling
- **Offline Support**: Message queuing and offline indicators
- **Auto-reconnection**: Automatic reconnection with retry logic
- **Chat History**: Persistent storage in localStorage
- **Export Function**: Download chat transcripts as JSON

### Admin Features
- **Admin Panel**: Comprehensive management interface (Ctrl+Shift+A)
- **Settings Management**: Configure welcome messages, file uploads, emoji support
- **Canned Responses**: Manage pre-written responses for agents
- **Statistics**: View message counts, response times, and satisfaction ratings
- **User Management**: Monitor active connections and user sessions

## Usage

### Basic Integration

The chat widget is automatically integrated into the application through the `App.tsx` component:

```typescript
// Already integrated in App.tsx
<ChatProvider>
  <ChatWidget />
</ChatProvider>
```

### Chat Context

Access chat functionality throughout the application:

```typescript
import { useChatContext } from './contexts/ChatContext';

const MyComponent = () => {
  const { 
    isOpen, 
    messages, 
    sendMessage, 
    openChat, 
    isConnected 
  } = useChatContext();
  
  // Your component logic
};
```

### Opening the Chat Programmatically

```typescript
const { openChat, markAllAsRead } = useChatContext();

const handleOpenChat = () => {
  openChat();
  markAllAsRead();
};
```

### Sending Messages

```typescript
const { sendMessage } = useChatContext();

const handleSendMessage = async () => {
  await sendMessage({
    type: 'text',
    content: 'Hello, I need help!',
    sender: 'user'
  });
};
```

## Configuration

### WebSocket Configuration

Configure WebSocket connection in your environment:

```bash
# .env
REACT_APP_WEBSOCKET_URL=ws://localhost:8000/ws/chat/
```

### Business Hours

Business hours are automatically calculated based on Korean Standard Time (KST):
- **Days**: Monday - Friday
- **Hours**: 09:00 - 18:00 KST
- **Timezone**: Asia/Seoul

### Chat Settings

Default settings can be customized via the admin panel or programmatically:

```typescript
const defaultSettings = {
  welcomeMessage: '안녕하세요! 에멜무지로 고객지원입니다.',
  quickReplies: ['서비스 문의', '기술 지원', '요금 문의'],
  allowFileUpload: true,
  allowEmoji: true,
  soundEnabled: true,
  maxMessageLength: 1000
};
```

## Admin Panel

Access the admin panel using the keyboard shortcut:
- **Windows/Linux**: `Ctrl + Shift + A`
- **Mac**: `Cmd + Shift + A`
- **Close**: `Escape`

### Admin Features

1. **Settings Tab**
   - Configure welcome message
   - Set maximum message length
   - Toggle file upload, emoji, and sound features

2. **Canned Responses Tab**
   - Add, edit, and delete pre-written responses
   - Manage quick reply templates

3. **Statistics Tab**
   - View message counts and metrics
   - Monitor business hours status
   - Check connection statistics

4. **Users Tab**
   - Monitor active connections
   - View user session information

## Development

### File Structure

```
src/components/chat/
├── ChatWidget.tsx          # Main chat widget component
├── ChatWindow.tsx          # Chat interface window
├── MessageList.tsx         # Message display component
├── TypingIndicator.tsx     # Typing animation component
├── QuickReplies.tsx        # Quick response buttons
├── EmojiPicker.tsx         # Emoji selection interface
├── FileUpload.tsx          # File upload component
├── AdminPanel.tsx          # Admin management interface
├── index.ts               # Component exports
└── __tests__/             # Test files
    └── ChatWidget.test.tsx

src/contexts/
└── ChatContext.tsx        # Chat state management

src/services/
└── websocket.ts          # WebSocket service

src/i18n/locales/
├── ko/common.json        # Korean translations
└── en/common.json        # English translations
```

### Testing

Run chat component tests:

```bash
# Run specific test
npm test -- --testPathPattern=ChatWidget.test.tsx

# Run all chat tests
npm test -- components/chat
```

### Performance Considerations

- **Lazy Loading**: Chat components are lazy-loaded to reduce initial bundle size
- **Message Virtualization**: Efficient rendering for large message histories
- **Debounced Typing**: Optimized typing indicators to reduce network calls
- **Image Optimization**: Automatic image compression for file uploads

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **WebSocket Support**: Required for real-time features
- **LocalStorage**: Used for chat history persistence
- **File API**: Required for file upload functionality

## Security

- **Input Validation**: All messages and files are validated
- **XSS Protection**: Messages are sanitized before display
- **File Type Validation**: Restricted file types for uploads
- **Rate Limiting**: Built-in spam prevention
- **CORS Configuration**: Proper WebSocket CORS handling

## Customization

### Styling

The chat components use Tailwind CSS classes and can be customized through:

1. **Theme Variables**: Defined in `src/styles/theme.ts`
2. **Dark Mode**: Automatic theme switching support
3. **CSS Custom Properties**: Override default colors and spacing

### Localization

Add new languages by creating translation files:

```typescript
// src/i18n/locales/[language]/common.json
{
  "chat": {
    "title": "Customer Support",
    // ... other translations
  }
}
```

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check WebSocket URL configuration
   - Verify server is running and accessible
   - Check for firewall or proxy issues

2. **Messages Not Persisting**
   - Ensure localStorage is available
   - Check for storage quota limits
   - Verify browser privacy settings

3. **Typing Indicators Not Working**
   - Verify WebSocket connection is established
   - Check for network connectivity issues
   - Ensure both parties are online

### Debug Mode

Enable debug logging in development:

```typescript
// In ChatContext.tsx or WebSocket service
console.log('Chat Debug:', { message, connection, status });
```

## Performance Metrics

- **Initial Load**: ~50KB gzipped (lazy loaded)
- **Memory Usage**: ~2MB with 100 messages
- **WebSocket Reconnection**: ~5 seconds retry interval
- **Message Send Time**: <500ms typical latency

## Future Enhancements

- **Voice Messages**: Audio recording and playback
- **Video Chat**: WebRTC integration for video calls
- **Screen Sharing**: Customer screen sharing capability
- **Chat Analytics**: Advanced metrics and reporting
- **Multi-agent Support**: Agent routing and handoff
- **Chat Bots**: AI-powered automated responses

## Support

For questions or issues with the chat feature:

1. Check this documentation
2. Review the test files for usage examples
3. Check the browser console for error messages
4. Contact the development team for assistance