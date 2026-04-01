import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styles from "../styles/MatchFormPage.module.css";
import {
  matchStore,
  validateMatch,
  isValid,
  type ValidationErrors,
} from "../store/matchStore";
import { ROLES, RESULTS, type Match, type Role, type Result } from "../types/match";

export default function MatchFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;
  const match = isEditing ? matchStore.getById(id!) : null;

  // Form state
  const [champion, setChampion] = useState(match?.champion || "");
  const [role, setRole] = useState<Role>(match?.role || "Mid");
  const [result, setResult] = useState<Result>(match?.result || "Victory");
  const [kills, setKills] = useState(match?.kills.toString() || "");
  const [deaths, setDeaths] = useState(match?.deaths.toString() || "");
  const [assists, setAssists] = useState(match?.assists.toString() || "");
  const [cs, setCs] = useState(match?.cs.toString() || "");
  const [visionScore, setVisionScore] = useState(
    match?.visionScore.toString() || "",
  );
  const [durationMins, setDurationMins] = useState(
    match ? Math.floor(match.duration / 60).toString() : "",
  );
  const [durationSecs, setDurationSecs] = useState(
    match ? (match.duration % 60).toString() : "",
  );
  const [date, setDate] = useState(match?.date || "");
  const [patch, setPatch] = useState(match?.patch || "");
  const [notes, setNotes] = useState(match?.notes || "");
  const [errors, setErrors] = useState<ValidationErrors>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert duration to seconds
    const totalSeconds =
      (parseInt(durationMins) || 0) * 60 + (parseInt(durationSecs) || 0);

    const matchData: Omit<Match, "id"> = {
      champion: champion.trim(),
      role,
      result,
      kills: parseInt(kills) || 0,
      deaths: parseInt(deaths) || 0,
      assists: parseInt(assists) || 0,
      cs: parseInt(cs) || 0,
      visionScore: parseInt(visionScore) || 0,
      duration: totalSeconds,
      date: date || new Date().toISOString(),
      patch: patch.trim(),
      notes: notes.trim() || undefined,
    };

    // Validate
    const validationErrors = validateMatch(matchData);
    if (!isValid(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    // Save
    if (isEditing && match) {
      matchStore.update(match.id, matchData);
    } else {
      matchStore.add(matchData);
    }

    navigate("/matches");
  };

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoIcon}>C</div>
          <span className={styles.logoText}>Caietul</span>
        </Link>
      </nav>

      <main className={styles.main}>
        <Link to="/matches" className={styles.back}>
          ← Back to matches
        </Link>

        <h1 className={styles.title}>{isEditing ? "Edit" : "Add"} Match</h1>
        <p className={styles.subtitle}>
          {isEditing
            ? "Update the details for this match entry."
            : "Record a new match and track your performance."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Match Info</div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="champion">
                  Champion
                </label>
                <input
                  id="champion"
                  className={`${styles.input} ${errors.champion ? "error" : ""}`}
                  type="text"
                  value={champion}
                  onChange={(e) => setChampion(e.target.value)}
                  placeholder="e.g. Syndra"
                />
                {errors.champion && (
                  <div className={styles.errorText}>{errors.champion}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  className={styles.select}
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="result">
                  Result
                </label>
                <select
                  id="result"
                  className={styles.select}
                  value={result}
                  onChange={(e) => setResult(e.target.value as Result)}
                >
                  {RESULTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="date">
                  Date
                </label>
                <input
                  id="date"
                  className={`${styles.input} ${errors.date ? "error" : ""}`}
                  type="datetime-local"
                  value={date ? new Date(date).toISOString().slice(0, 16) : ""}
                  onChange={(e) =>
                    setDate(new Date(e.target.value).toISOString())
                  }
                />
                {errors.date && (
                  <div className={styles.errorText}>{errors.date}</div>
                )}
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="patch">
                  Patch
                </label>
                <input
                  id="patch"
                  className={`${styles.input} ${errors.patch ? "error" : ""}`}
                  type="text"
                  value={patch}
                  onChange={(e) => setPatch(e.target.value)}
                  placeholder="e.g. 14.8"
                />
                {errors.patch && (
                  <div className={styles.errorText}>{errors.patch}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Your Stats</div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="kills">
                  Kills
                </label>
                <input
                  id="kills"
                  className={`${styles.input} ${errors.kills ? "error" : ""}`}
                  type="number"
                  value={kills}
                  onChange={(e) => setKills(e.target.value)}
                  min={0}
                  max={99}
                />
                {errors.kills && (
                  <div className={styles.errorText}>{errors.kills}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="deaths">
                  Deaths
                </label>
                <input
                  id="deaths"
                  className={`${styles.input} ${errors.deaths ? "error" : ""}`}
                  type="number"
                  value={deaths}
                  onChange={(e) => setDeaths(e.target.value)}
                  min={0}
                  max={99}
                />
                {errors.deaths && (
                  <div className={styles.errorText}>{errors.deaths}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="assists">
                  Assists
                </label>
                <input
                  id="assists"
                  className={`${styles.input} ${errors.assists ? "error" : ""}`}
                  type="number"
                  value={assists}
                  onChange={(e) => setAssists(e.target.value)}
                  min={0}
                  max={99}
                />
                {errors.assists && (
                  <div className={styles.errorText}>{errors.assists}</div>
                )}
              </div>
            </div>

            <div className={styles.grid3}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cs">
                  CS
                </label>
                <input
                  id="cs"
                  className={`${styles.input} ${errors.cs ? "error" : ""}`}
                  type="number"
                  value={cs}
                  onChange={(e) => setCs(e.target.value)}
                  min={0}
                  max={1500}
                />
                {errors.cs && (
                  <div className={styles.errorText}>{errors.cs}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="visionScore">
                  Vision Score
                </label>
                <input
                  id="visionScore"
                  className={`${styles.input} ${
                    errors.visionScore ? "error" : ""
                  }`}
                  type="number"
                  value={visionScore}
                  onChange={(e) => setVisionScore(e.target.value)}
                  min={0}
                  max={300}
                />
                {errors.visionScore && (
                  <div className={styles.errorText}>{errors.visionScore}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Duration (mm:ss)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    className={`${styles.input} ${errors.duration ? "error" : ""}`}
                    type="number"
                    value={durationMins}
                    onChange={(e) => setDurationMins(e.target.value)}
                    placeholder="mm"
                    min={0}
                    max={120}
                    style={{ flex: 1 }}
                  />
                  <span style={{ alignSelf: "center" }}>:</span>
                  <input
                    className={`${styles.input} ${errors.duration ? "error" : ""}`}
                    type="number"
                    value={durationSecs}
                    onChange={(e) => setDurationSecs(e.target.value)}
                    placeholder="ss"
                    min={0}
                    max={59}
                    style={{ flex: 1 }}
                  />
                </div>
                {errors.duration && (
                  <div className={styles.errorText}>{errors.duration}</div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Personal Notes</div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="notes">
                Notes (optional)
              </label>
              <input
                id="notes"
                className={styles.input}
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Good early game, bad teamfights..."
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <Link to="/matches" className={`${styles.btn} ${styles.btnCancel}`}>
              Cancel
            </Link>
            <button type="submit" className={`${styles.btn} ${styles.btnSave}`}>
              {isEditing ? "Save Changes" : "Add Match"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
