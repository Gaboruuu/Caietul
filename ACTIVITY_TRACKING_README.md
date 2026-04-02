# User Activity & Preferences Monitoring System

A comprehensive browser-based cookie monitoring system for tracking user activity and managing preferences in React applications.

## Overview

This system provides:

- **Activity Tracking**: Monitor user actions, page views, time spent, feature usage, interactions, and form submissions
- **Preferences Management**: Store and retrieve user settings with type-safe getters/setters
- **React Hooks**: Easy integration with React components
- **Cookie-based Storage**: Persistent storage using browser cookies
- **Activity Monitor Component**: Built-in UI for viewing activity and preferences
- **Privacy-Friendly**: Users can clear data, reset preferences, and understand what's being tracked

## Architecture

### Core Modules

#### 1. **Cookie Manager** (`utils/cookieManager.ts`)

Low-level cookie operations with options for expiration, security, etc.

**Functions:**

- `setCookie(name, value, options)` - Set a cookie
- `getCookie(name)` - Retrieve a cookie value
- `deleteCookie(name)` - Remove a cookie
- `getAllCookies()` - Get all cookies as an object
- `setJsonCookie(name, obj, options)` - Store JSON data
- `getJsonCookie(name)` - Retrieve JSON data

#### 2. **Activity Tracker** (`utils/activityTracker.ts`)

Track user actions and behavior patterns.

**Key Types:**

```typescript
interface ActivityEvent {
  action: string;
  timestamp: number;
  page?: string;
  metadata?: Record<string, unknown>;
}

interface ActivityLog {
  sessionId: string;
  userId?: string;
  startTime: number;
  events: ActivityEvent[];
  totalPageViews: number;
  totalActions: number;
}
```

**Functions:**

- `trackAction(action, metadata?)` - Record a custom action
- `trackPageView(page?)` - Track page navigation
- `trackTimeSpent(page, seconds)` - Log time on page
- `trackFeatureUsage(feature, details?)` - Track feature usage
- `trackInteraction(elementType, elementId?, metadata?)` - Track user interactions
- `getActivitySummary()` - Get session stats
- `getActivityLogData()` - Get full activity log
- `clearActivityLog()` - Clear all tracked data

#### 3. **Preferences Manager** (`utils/preferencesManager.ts`)

Manage user preferences with convenient setters/getters.

**Available Preferences:**

```typescript
interface UserPreferences {
  theme?: "light" | "dark" | "auto";
  sidebarCollapsed?: boolean;
  compactMode?: boolean;
  enableNotifications?: boolean;
  enableAnalytics?: boolean;
  itemsPerPage?: number;
  sortBy?: string;
  filterPresets?: Record<string, unknown>;
  language?: string;
  timezone?: string;
  [key: string]: unknown; // Custom preferences
}
```

**Functions:**

- `getPreferences()` - Get all preferences
- `getPreference(key, defaultValue?)` - Get specific preference
- `setPreference(key, value)` - Update single preference
- `setPreferences(updates)` - Update multiple preferences
- `resetPreferences()` - Reset to defaults
- Convenience functions: `getTheme()`, `setTheme()`, `isSidebarCollapsed()`, etc.

#### 4. **React Hooks** (`hooks/useTracking.ts`)

React hooks for easy integration.

**Hooks:**

- `usePageTracking(pageName?)` - Auto-track page views
- `useTimeTracking(pageName?)` - Auto-track time spent
- `usePreferences()` - Get/update preferences
- `useFeatureTracking(featureName)` - Track feature usage
- `useInteractionTracking(elementType, elementId?)` - Track interactions
- `useActivitySummary()` - Get activity stats
- `useActivityLog()` - Get activity log
- `usePreference<T>(key, defaultValue?)` - Get/update single preference
- `useClickTracking(elementId, metadata?)` - Track element clicks
- `useFormTracking(formId)` - Track form submissions
- `useScrollTracking(threshold?)` - Track scroll depth

#### 5. **Activity Monitor Component** (`components/ActivityMonitor.tsx`)

Dashboard UI for viewing activity and preferences.

Features:

- 3 tabs: Summary, Activity Log, Preferences
- Real-time stats and session data
- Clear activity log and reset preferences buttons
- Formatted timestamps and durations
- Responsive design

## Quick Start

### 1. Track Page Views

```typescript
import { usePageTracking } from '../hooks/useTracking';

export function MyPage() {
  // Auto-tracks page view on mount
  usePageTracking('MyPageName');

  return <div>Page content...</div>;
}
```

### 2. Track Feature Usage

```typescript
import { useFeatureTracking } from '../hooks/useTracking';

export function ExportButton() {
  const trackExport = useFeatureTracking('export_feature');

  const handleClick = () => {
    trackExport({ format: 'CSV', itemCount: 100 });
    // ... export logic
  };

  return <button onClick={handleClick}>Export</button>;
}
```

### 3. Manage Preferences

```typescript
import { usePreference } from '../hooks/useTracking';

export function ThemeSwitcher() {
  const [theme, setTheme] = usePreference('theme', 'auto');

  return (
    <select value={theme} onChange={e => setTheme(e.target.value)}>
      <option value="auto">Auto</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  );
}
```

### 4. View Activity

```typescript
import ActivityMonitor from '../components/ActivityMonitor';

export function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      <ActivityMonitor />
    </div>
  );
}
```

## Tracked Data

### Activity Events

- Page views and navigation
- Time spent on pages
- Feature usage
- User interactions (clicks, form submissions)
- Scroll depth
- Custom actions

### Preferences

- UI theme
- Layout settings
- Notification preferences
- Display preferences (items per page, sort order)
- Language and localization
- Custom user preferences

## Cookie Storage

**Cookies Created:**

1. `user_activity_log` - Activity data (JSON)
2. `user_preferences` - User preferences (JSON)

**Storage Details:**

- Activity log: ~50 most recent events (limited to prevent cookie bloat)
- Preferences: ~1KB typical size
- Expiration: 1 year (configurable)
- Path: `/` (configurable)
- SameSite: `Lax` (default)

## Privacy & GDPR Compliance

### User Control

Users can:

- View what data is being collected (Activity Monitor)
- Clear activity log (`clearActivityLog()`)
- Reset preferences to defaults (`resetPreferences()`)
- Opt-out of analytics (`setAnalyticsEnabled(false)`)

### Best Practices

1. **Transparency**
   - Inform users about tracking in privacy policy
   - Show Activity Monitor to users
   - Display opt-out options

2. **Consent**
   - Get explicit consent before tracking
   - Skip sensitive activities if not consented
   - Provide a way to revoke consent

3. **Data Minimization**
   - Only track necessary data
   - Use metadata sparingly
   - Clear old data regularly

4. **Data Security**
   - Never store sensitive info (passwords, PII) in cookies
   - Use HTTPS in production
   - Set `secure` flag on sensitive cookies

## Examples

### Complete Integration

```typescript
import { usePageTracking, useFeatureTracking, usePreference } from '../hooks/useTracking';
import ActivityMonitor from '../components/ActivityMonitor';
import { trackInteraction } from '../utils/activityTracker';

export function MatchPage() {
  usePageTracking('MatchPage');
  const [itemsPerPage, setItemsPerPage] = usePreference('itemsPerPage', 10);
  const trackDownload = useFeatureTracking('download_match');

  const handleDownload = (matchId: string) => {
    trackInteraction('button', 'download', { matchId });
    trackDownload({ matchId });
    // Download logic...
  };

  const handleItemsChange = (count: number) => {
    setItemsPerPage(count);
  };

  return (
    <div>
      <h1>Matches</h1>
      <label>
        Items per page:
        <input
          type="number"
          value={itemsPerPage}
          onChange={e => handleItemsChange(Number(e.target.value))}
        />
      </label>
      <button onClick={() => handleDownload('123')}>Download</button>
      <ActivityMonitor />
    </div>
  );
}
```

### Advanced: Custom Consent Banner

```typescript
import { useEffect } from 'react';
import { isAnalyticsEnabled, setAnalyticsEnabled } from '../utils/preferencesManager';

export function ConsentBanner() {
  const analyticsEnabled = isAnalyticsEnabled();

  const handleConsent = (granted: boolean) => {
    setAnalyticsEnabled(granted);
    // Store consent preference
  };

  if (analyticsEnabled === true) return null; // Already consented

  return (
    <div className="consent-banner">
      <p>We track your activity to improve your experience.</p>
      <button onClick={() => handleConsent(true)}>Accept</button>
      <button onClick={() => handleConsent(false)}>Decline</button>
    </div>
  );
}
```

## Configuration

### Cookie Options

```typescript
// Custom cookie expiration (30 days instead of 1 year)
setJsonCookie("user_preferences", preferences, {
  maxAge: 30 * 24 * 60 * 60,
  secure: true, // HTTPS only
  sameSite: "Strict",
});
```

### Default Preferences

Edit `preferencesManager.ts` to change defaults:

```typescript
const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  itemsPerPage: 50, // Change from 10 to 50
  language: "ro", // Default to Romanian
};
```

## Limitations

- **Cookie size limit**: ~4KB per cookie (handled by limiting events to 50 most recent)
- **Domain specific**: Cookies are domain-specific (won't share across domains)
- **User can delete**: Users can clear cookies in browser settings
- **No server sync**: All data is client-side (implement server sync if needed)
- **No user identification**: Anonymous tracking (no user IDs by default)

## Server Integration

To send data to your server:

```typescript
async function exportActivityToServer() {
  const log = getActivityLogData();
  const prefs = getPreferences();

  const response = await fetch("/api/user-activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ log, preferences: prefs }),
  });

  return response.json();
}
```

## Troubleshooting

### Cookies not persisting

- Check if cookies are enabled in browser
- Check SameSite policy on your domain
- Verify expiration time is set correctly

### Activity not tracking

- Ensure hooks are called in React components
- Check if analytics is enabled: `isAnalyticsEnabled()`
- View browser console for errors

### Performance issues

- Activity log is limited to 50 recent events
- Consider increasing the limit if needed
- Monitor cookie size in DevTools

## Files Created

```
src/
├── utils/
│   ├── cookieManager.ts          # Low-level cookie operations
│   ├── activityTracker.ts        # Activity tracking
│   └── preferencesManager.ts     # Preferences management
├── hooks/
│   └── useTracking.ts            # React hooks
├── components/
│   └── ActivityMonitor.tsx       # Dashboard component
└── styles/
    └── ActivityMonitor.module.css # Component styles

ACTIVITY_TRACKING_EXAMPLES.ts      # Usage examples
```

## Summary

This is a production-ready monitoring system that:
✅ Tracks user activity with privacy controls
✅ Manages preferences with type safety
✅ Provides React hooks for easy integration
✅ Includes built-in monitoring dashboard
✅ Follows GDPR best practices
✅ Works entirely client-side with cookies
✅ Fully documented with examples
