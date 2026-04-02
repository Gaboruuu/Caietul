/**
 * QUICK INTEGRATION GUIDE
 * 
 * Follow these steps to add activity tracking to your app in 5 minutes
 */

// ============================================================================
// STEP 1: Add Tracking to App.tsx
// ============================================================================

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { usePageTracking } from './hooks/useTracking';
import ActivityMonitor from './components/ActivityMonitor';

function App() {
  // Option 1: Track main app page
  usePageTracking('AppRoot');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/matches/:id" element={<MatchDetailPage />} />
        <Route path="/analytics" element={<ActivityMonitor />} />
      </Routes>
    </BrowserRouter>
  );
}

// ============================================================================
// STEP 2: Add Tracking to Existing Pages
// ============================================================================

// In src/pages/MatchHomePage.tsx
import { usePageTracking, useFeatureTracking } from '../hooks/useTracking';
import { trackInteraction } from '../utils/activityTracker';

export default function MatchHomePage() {
  // Just add this one line!
  usePageTracking('MatchHomePage');
  
  const trackDeleteAction = useFeatureTracking('delete_match');

  // In your delete button, add:
  const handleDelete = (matchId: string) => {
    trackInteraction('button', 'delete-btn', { matchId });
    trackDeleteAction({ matchId });
    // ... rest of delete logic
  };

  // Rest of your component stays the same
  return (
    // ... existing JSX
  );
}

// In src/pages/MatchFormPage.tsx
import { usePageTracking, useFormTracking } from '../hooks/useTracking';

export default function MatchFormPage() {
  usePageTracking('MatchFormPage');
  const trackFormSubmit = useFormTracking('match_form');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);
    
    trackFormSubmit(data);
    // ... rest of submit logic
  };

  return (
    // ... existing form
  );
}

// ============================================================================
// STEP 3: Add Preference Controls (Optional)
// ============================================================================

// In src/pages/SettingsPage.tsx (or create this page)
import { usePreference } from '../hooks/useTracking';

export function SettingsPage() {
  const [itemsPerPage, setItemsPerPage] = usePreference('itemsPerPage', 10);
  const [theme, setTheme] = usePreference('theme', 'auto');

  return (
    <div>
      <h1>Settings</h1>
      
      <label>
        Items Per Page:
        <input 
          type="number" 
          value={itemsPerPage}
          onChange={e => setItemsPerPage(Number(e.target.value))}
        />
      </label>

      <label>
        Theme:
        <select value={theme} onChange={e => setTheme(e.target.value)}>
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>
    </div>
  );
}

// ============================================================================
// STEP 4: View Analytics Dashboard
// ============================================================================

// Add a new route in App.tsx:
<Route path="/analytics" element={<ActivityMonitor />} />

// Now visit http://localhost:5173/analytics to see:
// - Session summary (duration, actions, page views)
// - Complete activity log (all tracked actions)
// - User preferences (current settings)
// - Clear/reset buttons

// ============================================================================
// STEP 5 (OPTIONAL): Add Tracking to All Clicks
// ============================================================================

// In your Header component or layout:
import { useClickTracking } from '../hooks/useTracking';

export function Header() {
  const trackHeaderClick = useClickTracking('header');

  return (
    <header ref={trackHeaderClick}>
      {/* All clicks here will be tracked */}
    </header>
  );
}

// ============================================================================
// STEP 6 (OPTIONAL): Track Time on Pages
// ============================================================================

import { useTimeTracking } from '../hooks/useTracking';

export function MatchDetailPage() {
  usePageTracking('MatchDetailPage');
  useTimeTracking('MatchDetailPage'); // Auto-tracks time when leaving
  
  // Rest of component...
}

// ============================================================================
// STEP 7: Verify It Works!
// ============================================================================

/*
1. Open your app in browser
2. Go to DevTools > Application > Cookies
3. Look for cookies:
   - user_activity_log
   - user_preferences

4. Navigate pages and perform actions
5. Visit /analytics page to see data
6. Refresh page - data persists!

Expected cookies to contain:
{
  "sessionId": "session_1234567890_abcdef123",
  "startTime": 1701234567890,
  "events": [
    {
      "action": "page_view",
      "timestamp": 1701234567890,
      "page": "/matches",
      "metadata": { ... }
    },
    ...
  ],
  "totalPageViews": 3,
  "totalActions": 12
}
*/

// ============================================================================
// CHEAT SHEET
// ============================================================================

/*
📊 Tracking Functions:

import { trackAction, trackPageView, trackTimeSpent, trackFeatureUsage, trackInteraction } from '../utils/activityTracker';

// Track any action
trackAction('user_logged_in', { userId: '123' });

// Track page view (usually via hook)
trackPageView('HomePage');

// Track time spent on page (usually via hook)
trackTimeSpent('HomePage', 45); // 45 seconds

// Track feature usage
trackFeatureUsage('export_matches', { format: 'CSV' });

// Track element interaction
trackInteraction('button', 'delete-btn', { matchId: '123' });

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎣 React Hooks:

import { 
  usePageTracking,
  useTimeTracking,
  useFeatureTracking,
  useInteractionTracking,
  usePreference,
  usePreferences,
  useActivitySummary,
  useActivityLog,
  useClickTracking,
  useFormTracking,
  useScrollTracking
} from '../hooks/useTracking';

usePageTracking('PageName');                    // Auto-track page view
useTimeTracking('PageName');                    // Auto-track time spent
const track = useFeatureTracking('feature');    // Get tracking function
const track = useInteractionTracking('btn');    // Get interaction tracker
const [val, setVal] = usePreference('key');     // Get/set preference
const [prefs, update, refresh] = usePreferences(); // Get all preferences
const summary = useActivitySummary();           // Get activity stats
const log = useActivityLog();                   // Get activity log
const track = useClickTracking('id');           // Track clicks
const track = useFormTracking('form-id');       // Track form submit
useScrollTracking(50);                          // Track 50% scroll

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ Preference Functions:

import { 
  getPreferences,
  setPreference,
  getPreference,
  setPreferences,
  resetPreferences,
  getTheme,
  setTheme,
  getItemsPerPage,
  setItemsPerPage,
  // ... more convenience functions
} from '../utils/preferencesManager';

// Get all preferences
const prefs = getPreferences();

// Get single preference
const theme = getPreference('theme');

// Set single preference
setPreference('theme', 'dark');

// Set multiple preferences
setPreferences({ theme: 'dark', language: 'ro' });

// Reset to defaults
resetPreferences();

// Convenience functions
const theme = getTheme();
setTheme('light');

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 Get Activity Data:

import { 
  getActivityLogData,
  getActivitySummary,
  clearActivityLog
} from '../utils/activityTracker';

const log = getActivityLogData();        // Full activity log
const summary = getActivitySummary();    // Session stats
clearActivityLog();                      // Clear all activity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 View Analytics:

Add to your app:
<ActivityMonitor />

Or create a route:
<Route path="/analytics" element={<ActivityMonitor />} />

Then visit: http://localhost:5173/analytics
*/

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

/*
Q: Cookies not appearing?
A: Check if cookies are enabled in browser. They're stored under your domain.

Q: Data not persisting?
A: Refresh the page and check DevTools > Application > Cookies

Q: Activity Monitor shows no data?
A: Make sure usePageTracking() was called on at least one page.
   Wait a few seconds for hooks to process.

Q: How do I get user-specific tracking?
A: Add userId to activity log:
   
   import { getActivityLog, saveActivityLog } from '../utils/activityTracker';
   const log = getActivityLog();
   log.userId = 'user123';
   saveActivityLog(log);

Q: How do I send data to my server?
A: After collecting data:

   const data = {
    activity: getActivityLogData(),
    preferences: getPreferences()
   };
   
   await fetch('/api/analytics', {
     method: 'POST',
     body: JSON.stringify(data)
   });

Q: Can I track custom events?
A: Yes! Use trackAction:

   trackAction('my_custom_event', {
     customData: 'anything you want'
   });
*/
