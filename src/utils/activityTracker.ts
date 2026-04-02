/**
 * User Activity Tracker - Monitors and logs user activity
 */

import { setJsonCookie, getJsonCookie } from "./cookieManager";
import { getPreference } from "./preferencesManager";

export interface ActivityEvent {
  action: string;
  timestamp: number;
  page?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityLog {
  sessionId: string;
  userId?: string;
  startTime: number;
  events: ActivityEvent[];
  totalPageViews: number;
  totalActions: number;
}

const ACTIVITY_COOKIE_NAME = "user_activity_log";
const MAX_EVENTS_PER_SESSION = 100;

/**
 * Check if user has consented to analytics tracking
 */
function isTrackingEnabled(): boolean {
  const analyticsEnabled = getPreference("enableAnalytics");
  // If preference is not set, return false (don't track until explicitly enabled)
  return analyticsEnabled === true;
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Initialize or get the current activity log
 */
function getActivityLog(): ActivityLog {
  let log = getJsonCookie<ActivityLog>(ACTIVITY_COOKIE_NAME);

  if (!log) {
    const sessionId = generateSessionId();
    log = {
      sessionId,
      startTime: Date.now(),
      events: [],
      totalPageViews: 0,
      totalActions: 0,
    };
  }

  return log;
}

/**
 * Save activity log to cookie
 */
function saveActivityLog(log: ActivityLog): void {
  setJsonCookie(ACTIVITY_COOKIE_NAME, log);
}

/**
 * Track a user action
 */
export function trackAction(
  action: string,
  metadata?: Record<string, unknown>,
): void {
  // Check if user has consented to tracking
  if (!isTrackingEnabled()) {
    return;
  }

  const log = getActivityLog();

  const event: ActivityEvent = {
    action,
    timestamp: Date.now(),
    page: window.location.pathname,
    metadata,
  };

  // Keep only the most recent events to avoid cookie size limits
  if (log.events.length >= MAX_EVENTS_PER_SESSION) {
    log.events = log.events.slice(-50);
  }

  log.events.push(event);
  log.totalActions++;

  saveActivityLog(log);
}

/**
 * Track page view
 */
export function trackPageView(page?: string): void {
  const log = getActivityLog();
  log.totalPageViews++;

  trackAction("page_view", { page: page || window.location.pathname });
}

/**
 * Track time spent on page
 */
export function trackTimeSpent(page: string, seconds: number): void {
  trackAction("time_spent", {
    page,
    duration: seconds,
  });
}

/**
 * Track feature usage
 */
export function trackFeatureUsage(
  feature: string,
  details?: Record<string, unknown>,
): void {
  trackAction("feature_used", {
    feature,
    ...details,
  });
}

/**
 * Track user interaction (clicks, form submissions, etc.)
 */
export function trackInteraction(
  elementType: string,
  elementId?: string,
  metadata?: Record<string, unknown>,
): void {
  trackAction("user_interaction", {
    elementType,
    elementId,
    ...metadata,
  });
}

/**
 * Get the current activity log
 */
export function getActivityLogData(): ActivityLog {
  return getActivityLog();
}

/**
 * Clear activity log
 */
export function clearActivityLog(): void {
  setJsonCookie(ACTIVITY_COOKIE_NAME, {
    sessionId: generateSessionId(),
    startTime: Date.now(),
    events: [],
    totalPageViews: 0,
    totalActions: 0,
  });
}

/**
 * Get activity summary
 */
export function getActivitySummary(): {
  sessionDuration: number;
  totalActions: number;
  totalPageViews: number;
  lastAction?: ActivityEvent;
} {
  const log = getActivityLog();
  const now = Date.now();
  const sessionDuration = now - log.startTime;

  return {
    sessionDuration,
    totalActions: log.totalActions,
    totalPageViews: log.totalPageViews,
    lastAction: log.events[log.events.length - 1],
  };
}
