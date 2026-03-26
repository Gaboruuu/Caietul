import { Link } from "react-router-dom";
import styles from "../styles/SiteChrome.module.css";

export default function Header() {
  return (
    <nav className={styles.nav}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>C</div>
        <span className={styles.logoText}>Caietul</span>
      </div>
      <div className={styles.navLinks}>
        <a href="#" className={styles.btnOutline}>
          Log in
        </a>
        <Link to="/matches" className={styles.btnPrimary}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}
