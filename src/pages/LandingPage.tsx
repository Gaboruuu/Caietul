import { Link } from "react-router-dom";
import styles from "../styles/LandingPage.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Header variant="public" />

      <section className={styles.hero}>
        <div className={styles.glow} />
        <div className={styles.badge}>League of Legends Analytics</div>
        <h1 className={styles.title}>
          Your games.
          <br />
          <span>Analyzed.</span>
        </h1>
        <p className={styles.tagline}>
          Caietul breaks down every match you play - what you did right, what
          went wrong, and exactly how to climb.
        </p>
        <div className={styles.ctaGroup}>
          <Link
            to="/login"
            className={`${styles.btnLg} ${styles.btnLgPrimary}`}
          >
            Start Analyzing -&gt;
          </Link>
          <Link
            to="/matches"
            className={`${styles.btnLg} ${styles.btnLgGhost}`}
          >
            View Demo
          </Link>
        </div>
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>Match</div>
            <h3>Match Breakdown</h3>
            <p>
              Deep stats for every game - KDA, CS, vision, damage share and more
              compared to your rank.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>Score</div>
            <h3>Performance Score</h3>
            <p>
              A single 0-100 score per game that tells you exactly how well you
              actually played.
            </p>
          </div>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>Tips</div>
            <h3>Improvement Tips</h3>
            <p>
              Champion-specific advice on what to fix and how to fix it -
              personalized to your playstyle.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
