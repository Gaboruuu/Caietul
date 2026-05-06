import { Link, NavLink, useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";
import styles from "../styles/SiteChrome.module.css";

type HeaderVariant = "public" | "app";

type HeaderProps = {
  variant?: HeaderVariant;
};

export default function Header({ variant = "public" }: HeaderProps) {
  const logoTo = variant === "app" ? "/matches" : "/";
  const navigate = useNavigate();

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
          {isAdmin() && (
            <NavLink
              to="/champions"
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
              }
            >
              Champions
            </NavLink>
          )}
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
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
            }
          >
            Chat
          </NavLink>
        </nav>
        <div className={styles.navActions}>
          <button
            type="button"
            className={styles.btnOutline}
            onClick={() => {
              // lazy logout: clear localStorage and go to landing
              localStorage.removeItem("currentUser");
              localStorage.removeItem("currentRoles");
              navigate("/");
            }}
          >
            Sign out
          </button>
        </div>
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
