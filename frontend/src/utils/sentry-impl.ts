// Static named imports from @sentry/react — enables tree-shaking across
// the dynamic import boundary in sentry.ts. Dynamically importing the
// @sentry/react barrel directly defeats tree-shaking (77 kB → 438 kB).
// See sentry.ts header comment for the full history.
export { init, captureException, withScope, setUser, addBreadcrumb } from '@sentry/react';
