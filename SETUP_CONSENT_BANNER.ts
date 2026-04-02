/**
 * HOW TO SETUP: Cookie Consent & Activity Logging
 * 
 * Quick setup for cookie consent banner and activity export
 */

// ============================================================================
// STEP 1: Add Cookie Consent Banner to Your App
// ============================================================================

import CookieConsent from './components/CookieConsent';
import { usePageTracking } from './hooks/useTracking';

function App() {
  usePageTracking('App');

  return (
    <div>
      {/* Add the cookie consent banner at the top level */}
      <CookieConsent />
      
      {/* Rest of your app */}
      <YourAppContent />
    </div>
  );
}

// ============================================================================
// STEP 2: Add Activity Exporter to Activity Monitor
// ============================================================================

import { ActivityExporter } from './components/ActivityExporter';
import ActivityMonitor from './components/ActivityMonitor';

export function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      
      {/* Allow users to download their data */}
      <ActivityExporter />
      
      {/* View their activity logs */}
      <ActivityMonitor />
    </div>
  );
}

// ============================================================================
// WHAT HAPPENS NOW
// ============================================================================

/*
FLOW:

1. User visits your app
   ↓
2. CookieConsent banner appears (if not already consented)
   ↓
3. User clicks "Accept & Continue" ✅
   ↓
4. Activity tracking STARTS logging events to cookies
   ↓
5. User can visit /analytics page to:
   - See activity summary (session duration, actions, page views)
   - View complete activity log
   - See their preferences
   - EXPORT data as JSON or CSV
   - Clear activity log
   
If user clicks "Decline" ❌:
- No tracking happens
- Consent is remembered
- Banner won't show again
- User can change mind by resetting preferences

============================================================================

WHAT USERS SEE:

1. Cookie Consent Banner (bottom of screen):
   📊 We Use Cookies
   - Explains what cookies do
   - Buttons: Decline | Learn More | Accept & Continue

2. Activity Monitor (at /analytics or custom route):
   Three tabs:
   - 📊 Activity Summary (session stats)
   - 📝 Activity Log (all tracked events)
   - ⚙️ User Preferences (settings)
   - Export buttons (JSON, CSV)

3. What Gets Stored:
   - user_activity_log (activity events)
   - user_preferences (user settings)
   - Both stay on user's device in browser cookies

============================================================================

TESTING:

1. Open DevTools (F12)
2. Go to Application > Cookies > Your Domain
3. No cookies yet? Visit page
4. See "Decline" in consent banner
5. Cookies NOT created yet ✅ (No tracking without consent)
6. Click "Accept & Continue"
7. Now user_activity_log & user_preferences appear in cookies
8. Navigate pages and see events added to user_activity_log
9. Go to /analytics to see Activity Monitor
10. Click "Export as JSON" to download log file

============================================================================

COOKIE CONTENT EXAMPLE:

{
  "sessionId": "session_1701234567890_abc123def",
  "startTime": 1701234567890,
  "events": [
    {
      "action": "page_view",
      "timestamp": 1701234567901,
      "page": "/analytics"
    },
    {
      "action": "element_clicked",
      "timestamp": 1701234567945,
      "page": "/analytics",
      "metadata": {
        "elementType": "button",
        "elementId": "export-json"
      }
    }
  ],
  "totalPageViews": 5,
  "totalActions": 23
}
*/

// ============================================================================
// OPTIONAL: Add to Existing Pages
// ============================================================================

import { usePageTracking } from '../hooks/useTracking';

export function YourExistingPage() {
  // Just add this one line to enable tracking for this page
  usePageTracking('YourExistingPageName');

  // Rest of your component...
  return (
    <div>
      {/* Your existing content */}
    </div>
  );
}

// ============================================================================
// OPTIONAL: Change Consent Preferences Programmatically
// ============================================================================

import { setAnalyticsEnabled, isAnalyticsEnabled } from '../utils/preferencesManager';

export function PreferenceControl() {
  const handleToggleTracking = () => {
    const currentState = isAnalyticsEnabled();
    setAnalyticsEnabled(!currentState);
    console.log(`Tracking is now ${!currentState ? 'enabled' : 'disabled'}`);
  };

  return (
    <button onClick={handleToggleTracking}>
      Toggle Activity Tracking
    </button>
  );
}

// ============================================================================
// OPTIONAL: Manual Consent Check
// ============================================================================

import { isAnalyticsEnabled } from '../utils/preferencesManager';

// Check if user has enabled tracking
if (isAnalyticsEnabled()) {
  console.log('User is being tracked');
  // Send data to server, etc.
} else {
  console.log('User has not consented to tracking');
}

// ============================================================================
// FILE STRUCTURE
// ============================================================================

/*
New files created:

src/
├── components/
│   ├── CookieConsent.tsx          ← Cookie consent banner
│   └── ActivityExporter.tsx       ← Export logs as files
├── styles/
│   ├── CookieConsent.module.css
│   └── ActivityExporter.module.css

Usage:
- Add <CookieConsent /> to App component (top level)
- Add <ActivityExporter /> to your analytics/settings page
- Both are optional - system works without them
- But recommended for user transparency & GDPR compliance
*/
