/**
 * Custom React Hooks for Activity Tracking and Preferences
 */

import { useEffect, useState, useCallback } from "react";
import {
  trackAction,
  trackPageView,
  trackTimeSpent,
  trackFeatureUsage,
  getActivitySummary,
  getActivityLogData,
  type ActivityLog,
} from "../utils/activityTracker";
import {
  getPreferences,
  setPreference,
  getPreference,
  type UserPreferences,
} from "../utils/preferencesManager";

/**
 * Hook to track page views
 */
export function usePageTracking(pageName?: string): void {
  useEffect(() => {
    const page = pageName || window.location.pathname;
    trackPageView(page);
  }, [pageName]);
}

/**
 * Hook to track time spent on a page
 */
export function useTimeTracking(pageName?: string): void {
  useEffect(() => {
    const page = pageName || window.location.pathname;
    const startTime = Date.now();

    return () => {
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);
      trackTimeSpent(page, durationSeconds);
    };
  }, [pageName]);
}

/**
 * Hook to get and manage preferences
 */
export function usePreferences(): [
  UserPreferences,
  (key: string, value: unknown) => void,
  () => void,
] {
  const [preferences, setPreferences] =
    useState<UserPreferences>(getPreferences());

  const updatePreference = useCallback((key: string, value: unknown) => {
    setPreference(key, value);
    setPreferences(getPreferences());
  }, []);

  const refreshPreferences = useCallback(() => {
    setPreferences(getPreferences());
  }, []);

  return [preferences, updatePreference, refreshPreferences];
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking(
  featureName: string,
): (details?: Record<string, unknown>) => void {
  return useCallback(
    (details?: Record<string, unknown>) => {
      trackFeatureUsage(featureName, details);
    },
    [featureName],
  );
}

/**
 * Hook to track user interactions
 */
export function useInteractionTracking(
  elementType: string,
  elementId?: string,
): (metadata?: Record<string, unknown>) => void {
  return useCallback(
    (metadata?: Record<string, unknown>) => {
      trackAction("user_interaction", {
        elementType,
        elementId,
        ...metadata,
      });
    },
    [elementType, elementId],
  );
}

/**
 * Hook to get activity summary
 */
export function useActivitySummary(): {
  sessionDuration: number;
  totalActions: number;
  totalPageViews: number;
} {
  const [summary, setSummary] = useState(() => getActivitySummary());

  useEffect(() => {
    const interval = setInterval(() => {
      setSummary(getActivitySummary());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return summary;
}

/**
 * Hook to get full activity log
 */
export function useActivityLog(): ActivityLog {
  const [log, setLog] = useState(() => getActivityLogData());

  useEffect(() => {
    const interval = setInterval(() => {
      setLog(getActivityLogData());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return log;
}

/**
 * Hook to get a specific preference with type safety
 */
export function usePreference<T = unknown>(
  key: string,
): [T | undefined, (value: T) => void];
export function usePreference<T = unknown>(
  key: string,
  defaultValue: T,
): [T, (value: T) => void];
export function usePreference<T = unknown>(
  key: string,
  defaultValue?: T,
): [T | undefined, (value: T) => void] {
  const [value, setValue] = useState<T | undefined>(() =>
    defaultValue === undefined
      ? getPreference<T>(key)
      : getPreference<T>(key, defaultValue),
  );

  const updateValue = useCallback(
    (newValue: T) => {
      setPreference(key, newValue);
      setValue(newValue);
    },
    [key],
  );

  return [value, updateValue];
}

/**
 * Hook to track clicks on specific elements
 */
export function useClickTracking(
  elementId: string,
  metadata?: Record<string, unknown>,
): (ref: React.RefObject<HTMLElement>) => void {
  return useCallback(
    (ref: React.RefObject<HTMLElement>) => {
      const element = ref.current;
      if (!element) return;

      const handleClick = () => {
        trackAction("element_clicked", {
          elementId,
          elementType: element.tagName,
          ...metadata,
        });
      };

      element.addEventListener("click", handleClick);

      return () => {
        element.removeEventListener("click", handleClick);
      };
    },
    [elementId, metadata],
  );
}

/**
 * Hook for tracking form submissions
 */
export function useFormTracking(
  formId: string,
): (data: Record<string, unknown>) => void {
  return useCallback(
    (data: Record<string, unknown>) => {
      trackAction("form_submitted", {
        formId,
        fields: Object.keys(data),
      });
    },
    [formId],
  );
}

/**
 * Hook to track scroll behavior
 */
export function useScrollTracking(threshold: number = 50): void {
  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout> | undefined;

    const handleScroll = () => {
      if (scrollTimeout !== undefined) {
        clearTimeout(scrollTimeout);
      }
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = Math.round(
          (window.scrollY /
            (document.documentElement.scrollHeight - window.innerHeight)) *
            100,
        );

        if (scrollPercentage >= threshold) {
          trackAction("page_scrolled", {
            scrollPercentage,
            page: window.location.pathname,
          });
        }
      }, 1000);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      if (scrollTimeout !== undefined) {
        clearTimeout(scrollTimeout);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);
}
