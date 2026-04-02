/**
 * EXAMPLE: How to Use the User Activity & Preferences Monitoring System
 * 
 * This file demonstrates how to integrate the activity tracking and preferences
 * management system throughout your React application.
 */

// ============================================================================
// 1. BASIC SETUP IN YOUR APP
// ============================================================================

import { usePageTracking, usePreferences, useFeatureTracking } from '../hooks/useTracking';
import ActivityMonitor from '../components/ActivityMonitor';

export default function App() {
  // Track page views automatically when component mounts
  usePageTracking('HomePage');

  return (
    <div>
      {/* Your app content */}
      <ActivityMonitor />
    </div>
  );
}

// ============================================================================
// 2. TRACKING PAGE VIEWS
// ============================================================================

import { usePageTracking, useTimeTracking } from '../hooks/useTracking';

export function MatchDetailPage() {
  // Automatically track page view when component mounts
  usePageTracking('MatchDetailPage');
  
  // Automatically track time spent when leaving page
  useTimeTracking('MatchDetailPage');

  return <div>Match Details...</div>;
}

// ============================================================================
// 3. TRACKING FEATURE USAGE
// ============================================================================

import { useFeatureTracking } from '../hooks/useTracking';
import { trackFeatureUsage } from '../utils/activityTracker';

export function MatchForm() {
  const trackFormUsage = useFeatureTracking('match_form');

  const handleSubmit = (formData: unknown) => {
    // Track feature usage with additional metadata
    trackFormUsage({
      formFieldCount: 5,
      completionTime: 30, // seconds
    });
    
    // Submit form...
  };

  return <form onSubmit={handleSubmit}>...</form>;
}

// ============================================================================
// 4. MANAGING USER PREFERENCES
// ============================================================================

import { usePreference, usePreferences } from '../hooks/useTracking';
import { setTheme, getTheme } from '../utils/preferencesManager';

export function Settings() {
  const [theme, setCurrentTheme] = usePreference<'light' | 'dark' | 'auto'>('theme', 'auto');
  const [allPreferences, updatePreference] = usePreferences();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setCurrentTheme(newTheme);
    // Apply theme to UI
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleItemsPerPageChange = (count: number) => {
    updatePreference('itemsPerPage', count);
  };

  return (
    <div>
      <h2>Settings</h2>
      
      <label>
        Theme:
        <select value={theme} onChange={e => handleThemeChange(e.target.value as any)}>
          <option value="auto">Auto</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>

      <label>
        Items Per Page:
        <input 
          type="number" 
          value={allPreferences.itemsPerPage}
          onChange={e => handleItemsPerPageChange(Number(e.target.value))}
        />
      </label>
    </div>
  );
}

// ============================================================================
// 5. TRACKING USER INTERACTIONS (CLICKS)
// ============================================================================

import { useRef } from 'react';
import { trackInteraction } from '../utils/activityTracker';

export function MatchCard({ matchId }: { matchId: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCardClick = () => {
    trackInteraction('match_card', matchId, {
      action: 'view_details',
    });
  };

  return (
    <div ref={cardRef} onClick={handleCardClick}>
      <h3>Match #{matchId}</h3>
      <p>Details...</p>
    </div>
  );
}

// ============================================================================
// 6. TRACKING FORM SUBMISSIONS
// ============================================================================

import { useFormTracking } from '../hooks/useTracking';

export function MatchFormSubmit() {
  const trackFormSubmission = useFormTracking('match_form');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    // Track the submission with field names
    trackFormSubmission(data);

    // Submit form to server...
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="matchName" placeholder="Match Name" />
      <input type="number" name="duration" placeholder="Duration" />
      <button type="submit">Submit</button>
    </form>
  );
}

// ============================================================================
// 7. TRACKING SCROLL BEHAVIOR
// ============================================================================

import { useScrollTracking } from '../hooks/useTracking';

export function LongContentPage() {
  // Track when user scrolls 50% down the page
  useScrollTracking(50);

  return (
    <div>
      <h1>Long Content Page</h1>
      {/* Long content... */}
    </div>
  );
}

// ============================================================================
// 8. GETTING ACTIVITY DATA PROGRAMMATICALLY
// ============================================================================

import { useActivityLog, useActivitySummary } from '../hooks/useTracking';
import { getActivityLogData, getActivitySummary } from '../utils/activityTracker';

export function Analytics() {
  const summary = useActivitySummary();
  const log = useActivityLog();

  const handleExport = () => {
    const data = {
      summary,
      log,
      exportedAt: new Date().toISOString(),
    };
    
    // Send to analytics server
    console.log('Exporting activity data:', data);
  };

  return (
    <div>
      <h2>Analytics</h2>
      <p>Session Duration: {summary.sessionDuration / 1000}s</p>
      <p>Total Actions: {summary.totalActions}</p>
      <p>Page Views: {summary.totalPageViews}</p>
      <button onClick={handleExport}>Export Data</button>
    </div>
  );
}

// ============================================================================
// 9. DIRECT API USAGE (without hooks)
// ============================================================================

import {
  trackAction,
  trackFeatureUsage,
  getActivitySummary,
  clearActivityLog,
} from '../utils/activityTracker';
import {
  getPreferences,
  setPreference,
  getPreference,
  resetPreferences,
} from '../utils/preferencesManager';

export function DirectUsageExample() {
  const handleEvent = () => {
    // Track custom action
    trackAction('custom_action', {
      source: 'button_click',
      timestamp: Date.now(),
    });

    // Track feature usage
    trackFeatureUsage('export_feature', {
      format: 'CSV',
      rowCount: 100,
    });

    // Get current preferences
    const userLang = getPreference('language', 'en');
    
    // Update preference
    setPreference('language', 'ro');

    // Get all preferences
    const allPrefs = getPreferences();
    console.log(allPrefs);

    // Get activity summary
    const summary = getActivitySummary();
    console.log(`Session duration: ${summary.sessionDuration}ms`);
  };

  return <button onClick={handleEvent}>Trigger Tracking</button>;
}

// ============================================================================
// 10. INTEGRATION IN EXISTING PAGES
// ============================================================================

import { usePageTracking, useFeatureTracking } from '../hooks/useTracking';
import { trackInteraction } from '../utils/activityTracker';

export function MatchHomePage() {
  usePageTracking('MatchHomePage');
  const trackDeleteAction = useFeatureTracking('delete_match');

  const handleDeleteMatch = (matchId: string) => {
    trackDeleteAction({ matchId });
    // Delete logic...
  };

  const handleDeleteClick = (matchId: string) => {
    trackInteraction('button', 'delete_button', { matchId });
  };

  return (
    <div>
      <h1>Matches</h1>
      {/* Your match list */}
      <button onMouseDown={() => handleDeleteClick('123')}>Delete</button>
    </div>
  );
}

// ============================================================================
// 11. COOKIES STORED IN BROWSER
// ============================================================================

/*
The system stores the following cookies in the browser:

1. user_activity_log
   - Contains: SessionID, timestamps, action log, page views, action count
   - Size: Limited to ~50 recent events to avoid cookie size limits
   - Expires: End of browser session (can be configured)

2. user_preferences
   - Contains: Theme, sidebar state, items per page, language, etc.
   - Size: ~1KB for typical preferences
   - Expires: 1 year (can be configured)

3. session_id (optional)
   - Contains: Unique identifier for the current session
   - Used for: Correlating activities across pageloads

To inspect in DevTools:
- Open Chrome/Firefox DevTools (F12)
- Go to Application > Cookies > Your domain
- Look for cookies starting with "user_" or "session_"
*/

// ============================================================================
// 12. PRIVACY & COMPLIANCE NOTES
// ============================================================================

/*
Best Practices:
1. Inform users about tracking via privacy policy
2. Get consent before enabling non-essential tracking
3. Provide option to opt-out or reset tracking data
4. Don't store sensitive information in cookies
5. Use httpOnly flag on sensitive cookies (server-side)
6. Clear tracking data on logout

GDPR Compliance:
- Cookies require user consent (get agreement before tracking)
- Users must be able to delete/reset data (resetPreferences, clearActivityLog)
- Provide transparency about what data is collected
- Implement data retention policies
*/
