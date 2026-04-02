import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/RegisterPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [summoner, setSummoner] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !summoner.trim() ||
      !password.trim() ||
      !acceptedTerms
    ) {
      return;
    }

    navigate("/matches");
  };

  return (
    <div className={styles.page}>
      <div className={styles.split}>
        <div className={styles.left}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>C</div>
            <span className={styles.logoText}>Caietul</span>
          </Link>

          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={styles.stepNum}>1</div>
              <div className={styles.stepContent}>
                <h4>Create your account</h4>
                <p>Sign up with your email or Riot account in seconds.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>2</div>
              <div className={styles.stepContent}>
                <h4>Link your summoner</h4>
                <p>Connect your League account to start pulling match data.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNum}>3</div>
              <div className={styles.stepContent}>
                <h4>Get your analysis</h4>
                <p>
                  See your performance score and improvement tips for every
                  game.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.leftBottom}>
            <h2>
              Start climbing
              <br />
              <span>today.</span>
            </h2>
            <p>Free forever. No credit card needed.</p>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.formBox}>
            <h1>Create account</h1>
            <p className={styles.subtitle}>
              Already have one? <Link to="/login">Log in</Link>
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="register-first-name">First name</label>
                  <input
                    id="register-first-name"
                    type="text"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="register-last-name">Last name</label>
                  <input
                    id="register-last-name"
                    type="text"
                    placeholder="Pop"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label htmlFor="register-email">Email address</label>
                <input
                  id="register-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="register-summoner">Summoner name</label>
                <input
                  id="register-summoner"
                  type="text"
                  placeholder="ShadowBlade#EUW"
                  value={summoner}
                  onChange={(event) => setSummoner(event.target.value)}
                  required
                />
                <div className={styles.hint}>Format: SummonerName#TAG</div>
              </div>

              <div className={styles.field}>
                <label htmlFor="register-password">Password</label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <div className={styles.hint}>Minimum 8 characters</div>
              </div>

              <div className={styles.terms}>
                <input
                  id="register-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  required
                />
                <label htmlFor="register-terms">
                  I agree to the <a href="#">Terms of Service</a> and{" "}
                  <a href="#">Privacy Policy</a>
                </label>
              </div>

              <button type="submit" className={styles.btnSubmit}>
                Create account →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
