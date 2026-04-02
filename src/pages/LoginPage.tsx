import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/AuthPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    navigate("/");
  };

  return (
    <div className={styles.page}>
      <div className={styles.split}>
        <aside className={styles.left}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>C</div>
            <span className={styles.logoText}>Caietul</span>
          </Link>

          <div className={styles.leftContent}>
            <h2>
              Track every
              <br />
              <span>game you play.</span>
            </h2>
            <p>
              Join thousands of players using Caietul to understand their
              mistakes and climb the ladder faster.
            </p>
          </div>

          <div className={styles.statCards}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div>
                <div className={styles.statLabel}>
                  Average rank gain after 30 days
                </div>
                <div className={styles.statValue}>+1.4 divisions</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎮</div>
              <div>
                <div className={styles.statLabel}>Matches analyzed</div>
                <div className={styles.statValue}>2.4M+</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div>
                <div className={styles.statLabel}>Active players</div>
                <div className={styles.statValue}>48,200</div>
              </div>
            </div>
          </div>
        </aside>

        <section className={styles.right}>
          <div className={styles.formBox}>
            <h1>Welcome back</h1>
            <p className={styles.subtitle}>
              Don&apos;t have an account?{" "}
              <Link to="/register">Sign up free</Link>
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label htmlFor="login-email">Email address</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className={styles.forgot}>
                <a href="#" onClick={(e) => e.preventDefault()}>
                  Forgot password?
                </a>
              </div>

              <button type="submit" className={styles.btnSubmit}>
                Log in
              </button>
            </form>

            <div className={styles.divider}>or continue with</div>

            <button
              type="button"
              className={styles.btnRiot}
              onClick={() => navigate("/matches")}
            >
              ⚔️ Continue with Riot Account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
