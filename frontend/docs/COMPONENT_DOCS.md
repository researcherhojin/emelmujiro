# Component Documentation

## Overview

This document provides comprehensive documentation for the Emelmujiro frontend components.

## Component Architecture

### Directory Structure

```
src/components/
├── admin/          # Admin dashboard components
├── blog/           # Blog-related components
├── chat/           # Chat widget and related components
├── common/         # Shared/reusable components
├── contact/        # Contact form components
├── layout/         # Layout components
├── pages/          # Page-level components
└── sections/       # Homepage section components
```

## Core Components

### 1. Button Component

**Location:** `/src/components/common/Button.tsx`

**Props:**

- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- `icon`: React.ReactNode
- `iconPosition`: 'left' | 'right'
- `to`: string (for internal links)
- `href`: string (for external links)

**Usage:**

```tsx
// Regular button
<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

// Link button
<Button to="/about" variant="secondary">
  Learn More
</Button>

// External link
<Button href="https://example.com" variant="outline">
  Visit Site
</Button>
```

### 2. Card Component

**Location:** `/src/components/common/Card.tsx`

**Props:**

- `children`: React.ReactNode
- `className`: string
- `hover`: boolean (default: true)
- `padding`: string (default: 'p-8')

**Usage:**

```tsx
<Card hover={true} className="custom-class">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>
```

### 3. SkeletonScreen Component

**Location:** `/src/components/common/SkeletonScreen.tsx`

**Props:**

- `variant`: 'blog' | 'card' | 'list' | 'profile' | 'hero' | 'custom'
- `count`: number (default: 1)
- `animate`: boolean (default: true)
- `className`: string

**Usage:**

```tsx
// Blog post skeleton
<SkeletonScreen variant="blog" count={3} />

// Card skeleton
<SkeletonScreen variant="card" count={4} />

// List skeleton
<SkeletonScreen variant="list" count={5} />
```

### 4. ContactForm Component

**Location:** `/src/components/contact/ContactForm.tsx`

**Props:**

- `formData`: FormData object
- `isSubmitting`: boolean
- `isOnline`: boolean
- `onInputChange`: ChangeEvent handler
- `onSubmit`: FormEvent handler

**Features:**

- Responsive form layout
- Offline mode support
- Form validation
- Accessibility compliant

### 5. ChatWidget Component

**Location:** `/src/components/chat/ChatWidget.tsx`

**Props:**

- `className`: string (optional)

**Features:**

- Real-time messaging
- File uploads
- Emoji picker
- Admin panel
- Typing indicators
- Quick replies

### 6. NotificationPermission Component

**Location:** `/src/components/common/NotificationPermission.tsx`

**Props:** None

**Features:**

- Auto-displays after 10 seconds
- Handles browser notification permissions
- Stores dismissal in localStorage
- PWA notification support

## Performance Optimizations

### React.memo Applied

All major components use React.memo for preventing unnecessary re-renders:

- Button
- Card
- ChatWidget
- ContactForm
- SkeletonScreen
- BlogCard
- EmojiPicker
- FileUpload
- QuickReplies
- TypingIndicator

### Code Splitting

Components are lazy-loaded using React.lazy():

```tsx
const ContactPage = lazy(() => import('./components/pages/ContactPage'));
const BlogListPage = lazy(() => import('./components/blog/BlogListPage'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));
```

## Utility Functions

### Performance Monitor

**Location:** `/src/utils/performanceMonitor.ts`

**Functions:**

- `markPerformance(name: string)`: Mark a performance point
- `measurePerformance(name, startMark, endMark?)`: Measure between marks
- `getPerformanceMetrics()`: Get current metrics
- `reportPerformanceMetrics()`: Report metrics to analytics
- `checkPerformanceBudgets()`: Check against performance budgets

**Usage:**

```tsx
import {
  markPerformance,
  measurePerformance,
} from '@/utils/performanceMonitor';

markPerformance('component-start');
// ... component logic
markPerformance('component-end');
measurePerformance('component-load', 'component-start', 'component-end');
```

### Constants

**Location:** `/src/utils/constants.ts`

**Exports:**

- `INQUIRY_TYPE_MAP`: Contact form inquiry types
- `CONTACT_EMAIL`: Default contact email
- `FORM_LIMITS`: Form field validation limits
- `BUSINESS_HOURS`: Business hours info
- `SERVICE_CATEGORIES`: Service offerings
- `STORAGE_KEYS`: localStorage key names
- `API_ENDPOINTS`: API endpoint URLs
- `DEFAULT_META`: Default SEO meta tags

## Context Providers

### UIProvider

**Location:** `/src/contexts/UIContext.tsx`

**Provides:**

- Theme management (light/dark)
- Language settings
- Notification system
- Loading states

### ChatProvider

**Location:** `/src/contexts/ChatContext.tsx`

**Provides:**

- Chat state management
- Message history
- Connection status
- Business hours
- Settings management

### BlogProvider

**Location:** `/src/contexts/BlogContext.tsx`

**Provides:**

- Blog post data
- Categories
- Search functionality
- Pagination

### AuthProvider

**Location:** `/src/contexts/AuthContext.tsx`

**Provides:**

- User authentication
- Login/logout functionality
- Token management
- User profile data

## Testing

### Test Utilities

**Location:** `/src/test-utils/`

**renderWithProviders:** Renders components with all necessary providers

```tsx
import { renderWithProviders } from '@/test-utils';

test('component renders', () => {
  const { getByText } = renderWithProviders(<Component />);
  expect(getByText('Text')).toBeInTheDocument();
});
```

### Test Coverage Goals

- Unit tests: 80% coverage minimum
- Integration tests: Critical user flows
- E2E tests: Main user journeys

## Accessibility

### ARIA Labels

All interactive components include proper ARIA labels:

```tsx
<button aria-label="Close dialog">
<input aria-label="Email address" aria-required="true">
<div role="status" aria-label="Loading">
```

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators are visible
- Tab order is logical
- Escape key closes modals/dialogs

### Screen Reader Support

- Semantic HTML elements
- Proper heading hierarchy
- Alt text for images
- sr-only class for screen reader only text

## Styling Conventions

### Tailwind CSS Classes

- Use utility classes for styling
- Avoid inline styles
- Group related utilities
- Use dark mode variants

### CSS Class Organization

```tsx
className={`
  // Layout
  flex items-center justify-between
  // Spacing
  px-4 py-2 mb-4
  // Typography
  text-sm font-medium
  // Colors
  text-gray-900 dark:text-white
  bg-white dark:bg-gray-800
  // Borders
  border-2 border-gray-200
  // Effects
  shadow-md hover:shadow-lg
  // Transitions
  transition-all duration-200
  // Responsive
  md:px-6 lg:px-8
`}
```

## Best Practices

### Component Guidelines

1. Keep components small and focused
2. Use TypeScript for all components
3. Define prop interfaces
4. Include display names for debugging
5. Use memo for performance optimization
6. Handle loading and error states
7. Include proper accessibility attributes

### Code Organization

1. Group related components in folders
2. Co-locate tests with components
3. Extract reusable logic to hooks
4. Use constants for repeated values
5. Keep business logic in services
6. Use contexts for shared state

### Performance Tips

1. Lazy load heavy components
2. Use React.memo for pure components
3. Optimize images with proper formats
4. Minimize bundle size
5. Monitor Core Web Vitals
6. Implement proper caching strategies

## Deployment

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build

# Test build
npm run test:build
```

### Environment Variables

Required environment variables:

- `REACT_APP_API_URL`: API endpoint
- `REACT_APP_CONTACT_EMAIL`: Contact email
- `REACT_APP_USE_MOCK_API`: Use mock API (true/false)

### GitHub Pages Deployment

The app is configured for GitHub Pages deployment:

- Uses HashRouter for routing
- Homepage set to /emelmujiro/
- Auto-deploys on main branch push
