import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";
import styles from "../styles/SiteChrome.module.css";

type HeaderVariant = "public" | "app";

type HeaderProps = {
  variant?: HeaderVariant;
};

export default function Header({ variant = "public" }: HeaderProps) {
  const logoTo = variant === "app" ? "/matches" : "/";
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const appNavLinks = [
    { to: "/matches", label: "Matches", adminOnly: false },
    { to: "/champions", label: "Champions", adminOnly: true },
    { to: "/statistics", label: "Statistics", adminOnly: false },
    { to: "/security", label: "Security", adminOnly: true },
    { to: "/tilt-meter", label: "Tilt Meter", adminOnly: false },
    { to: "/chat", label: "Chat", adminOnly: false },
  ];

  const closeMobileNav = () => {
    setIsMobileNavOpen(false);
  };

  const handleSignOut = () => {
    // lazy logout: clear localStorage and go to landing
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRoles");
    setIsMobileNavOpen(false);
    navigate("/");
  };

  if (variant === "app") {
    return (
      <header className={styles.header}>
        <Link to={logoTo} className={styles.logo} aria-label="Caietul home">
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Caietul</span>
        </Link>

        <button
          type="button"
          className={styles.mobileMenuButton}
          aria-expanded={isMobileNavOpen}
          aria-controls="app-nav-links"
          onClick={() => setIsMobileNavOpen((open) => !open)}
        >
          Menu
        </button>

        <nav
          id="app-nav-links"
          className={`${styles.navLinks} ${isMobileNavOpen ? styles.navLinksOpen : ""}`}
          aria-label="App navigation"
          key={location.pathname}
        >
          {appNavLinks.map((link) => {
            if (link.adminOnly && !isAdmin()) return null;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`
                }
                onClick={closeMobileNav}
              >
                {link.label}
              </NavLink>
            );
          })}
        </nav>
        <div
          className={`${styles.navActions} ${isMobileNavOpen ? styles.navActionsOpen : ""}`}
        >
          <button
            type="button"
            className={styles.btnOutline}
            onClick={handleSignOut}
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
