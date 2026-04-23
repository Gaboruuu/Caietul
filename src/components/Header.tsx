import { Link, NavLink } from "react-router-dom";
import styles from "../styles/SiteChrome.module.css";

type HeaderVariant = "public" | "app";

type HeaderProps = {
  variant?: HeaderVariant;
};

export default function Header({ variant = "public" }: HeaderProps) {
  const logoTo = variant === "app" ? "/matches" : "/";

  if (variant === "app") {
    return (
      <header className={styles.header}>
        <Link to={logoTo} className={styles.logo} aria-label="Caietul home">
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Caietul</span>
        </Link>

        <nav className={styles.navLinks} aria-label="App navigation">
          <NavLink
            to="/matches"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Matches
          </NavLink>
          <NavLink
            to="/champions"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Champions
          </NavLink>
          <NavLink
            to="/statistics"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Statistics
          </NavLink>
          <NavLink
            to="/tilt-meter"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Tilt Meter
          </NavLink>
        </nav>
      </header>
    );
  }

  return (
    <header className={styles.header}>
      <Link to={logoTo} className={styles.logo} aria-label="Caietul home">
        <div className={styles.logoIcon}>C</div>
        <span className={styles.logoText}>Caietul</span>
      </Link>

      <div className={styles.navActions}>
        <Link to="/login" className={styles.btnOutline}>
          Log in
        </Link>
        <Link to="/login" className={styles.btnPrimary}>
          Get Started
        </Link>
      </div>
    </header>
  );
}
