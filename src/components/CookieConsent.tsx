/**
 * Cookie Consent Banner - Informs users about tracking and gets consent
 */

import { useState } from "react";
import {
  isAnalyticsEnabled,
  setAnalyticsEnabled,
} from "../utils/preferencesManager";
import styles from "../styles/CookieConsent.module.css";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(() => {
    // Initialize state based on whether user has already made a choice
    const analyticsEnabled = isAnalyticsEnabled();
    return analyticsEnabled === undefined;
  });

  const handleAccept = () => {
    setAnalyticsEnabled(true);
    setShowBanner(false);
    console.log("✅ User accepted cookie tracking");
  };

  const handleDecline = () => {
    setAnalyticsEnabled(false);
    setShowBanner(false);
    console.log("❌ User declined cookie tracking");
  };

  const handleLearnMore = () => {
    // Navigate to privacy policy or show modal
    window.open("/privacy-policy", "_blank");
  };

  if (!showBanner) return null;

  return (
    <div className={styles.container}>
      <div className={styles.banner}>
        <div className={styles.content}>
          <h3>📊 We Use Cookies</h3>
          <p>
            We track your activity and preferences using browser cookies to
            improve your experience. Your data stays on your device and is never
            sent to our servers.
          </p>
          <p className={styles.small}>
            You can view, export, or delete this data anytime in the activity
            monitor.
          </p>
        </div>

        <div className={styles.actions}>
          <button onClick={handleDecline} className={styles.declineBtn}>
            Decline
          </button>
          <button onClick={handleLearnMore} className={styles.learnBtn}>
            Learn More
          </button>
          <button onClick={handleAccept} className={styles.acceptBtn}>
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
